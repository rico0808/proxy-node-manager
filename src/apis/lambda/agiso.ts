import { Context } from "@midwayjs/koa";
import { useConfig, useContext } from "@midwayjs/hooks-core";
import { parse } from "querystring";
import { useRandom, useSendReq, useStaticTime, useVerifySign, useWwMsg } from "../hooks/agisoHook";
import { IF_AgisoBodyOrder } from "../interface";
import { useEntityModel } from "@midwayjs/orm";
import { Orders } from "../entity/Orders";
import { Users } from "../entity/Users";
import { useGoods, useRefundGoods } from "../hooks/userHook";
import { AgisoBodySchema, AgisoQuerySchema } from "../dto/AgisoDTO";
import { z } from "zod";
import { formatTime, valid } from "../utils/tools";
import { useFreeNode } from "../hooks/useNode";
import dayjs from "dayjs";

const ctx = () => useContext<Context>();
const mOrder = () => useEntityModel(Orders);
const mUsers = () => useEntityModel(Users);

const mOrders = () => useEntityModel(Orders);
const config = () => useConfig();

export const cb = async () => {
  const url = parse(ctx().request.url.split("?")[1]) as any;
  const query: z.infer<typeof AgisoQuerySchema> = valid(AgisoQuerySchema, url);
  const body: z.infer<typeof AgisoBodySchema> = valid(AgisoBodySchema, ctx().request.body);
  const data: IF_AgisoBodyOrder = JSON.parse(body.json);

  // 验签
  const verify = await useVerifySign(query, body);
  if (!verify) return { msg: "签名错误" };

  // 买家付款成功
  if (query.aopic === "2") return _PaymentSuccess(data);
  // 退款成功
  if (query.aopic === "65536") return _RefundSuccess(data);
};

// 订单付款
const _PaymentSuccess = async (data: IF_AgisoBodyOrder) => {
  try {
    // 查找订单
    let order = await mOrder().findOne({ where: { tid: data.TidStr } });
    // 防止重复推送
    if (order) if (order.status === 2) return { msg: "订单通知重复推送" };

    // 查找用户
    let user = await mUsers().findOne({ where: { tb: data.BuyerNick } });
    if (!user) {
      user = new Users();
      user.tb = data.BuyerNick;
      user.account = data.TidStr.substring(data.TidStr.length - 6);
      user.passwd = useRandom(111111, 999999);
      user.expire = useStaticTime();
      await mUsers().save(user);
    }

    // 获取负载最小节点
    const node = await useFreeNode();
    if (!node) return { msg: `未找到任何可用节点，订单编号：${data.TidStr}` };

    // 获取订单产品
    const prods = data.Orders.map((item) => ({ sku: item.OuterSkuId, num: item.Num }));
    if (!prods) return _sendAliwwMsg(false, `订单号：${data.TidStr}\n亲亲，该产品未在库存中找到，请联系客服手动补货。`);

    // 判断是否试用
    const useTest = await prods.filter((item) => item.sku === config().testGoods);
    if (useTest.length > 0) {
      // 已经试用
      if (user.useTest === 1) {
        return _sendAliwwMsg(false, `订单号：${data.TidStr}\n亲亲，您已经试用过加速器啦，无法再次试用哦。`);
      }
      // 购买多个试用
      if (useTest.length > 1 || (useTest.length === 1 && useTest[0].num > 1)) {
        return _sendAliwwMsg(false, `订单号：${data.TidStr}\n亲亲，试用产品尽可购买一次哦，请勿叠加购买。`);
      }
      // 改变试用状态
      user.useTest = 1;
      user.testTime = dayjs().toISOString();
      await mUsers().save(user);
    }

    user = await useGoods(prods, user);

    // 创建订单
    if (!order) {
      order = new Orders();
      order.tid = data.TidStr;
      order.uid = user.id;
      order.source = "TB";
      order.tb = data.BuyerNick;
      order.payment = data.Payment;
      order.product = JSON.stringify(data.Orders);
      order.status = 1;
      order.buyTime = data.Created;
      await mOrders().save(order);
    }
    // 更改订单状态
    order.status = 2;
    mOrders().save(order);

    // 返回
    const { account, passwd, expire } = user;
    const Memo = `连接账号：${account} / 连接密码：${passwd} / 到期时间：${formatTime(expire)}`;
    const AliwwMsg = useWwMsg()
      .replace("{tid}", order.tid)
      .replace("{ip}", node.ddns)
      .replace("{port}", node.port.toString())
      .replace("{account}", account)
      .replace("{passwd}", passwd)
      .replace("{url}", config().webUrl + "/?ac=" + account);

    return _sendAliwwMsg(true, AliwwMsg, Memo);
  } catch (error) {
    console.log(error);
    _sendFailMessage("亲亲，自动发货失败了，请联系客服进行处理。", data.TidStr);
    return { msg: `执行自动发货出错 ${error.message}` };
  }
};

// 用户退款成功
const _RefundSuccess = async (data: IF_AgisoBodyOrder) => {
  const order = await mOrder().findOne({ where: { tid: data.TidStr } });
  if (!order) return { msg: "未找到订单" };
  if (order.status === -1) return { msg: "订单已退款" };

  const user = await mUsers().findOne({ tb: order.tb });
  if (!user) return { msg: "用户不存在" };

  // 扣除订单对应套餐
  const refundGoods = JSON.parse(order.product).map((item) => ({ sku: item.OuterSkuId, num: item.Num }));
  await useRefundGoods(refundGoods, user);

  // 更改订单状态
  order.status = -1;
  await mOrders().save(order);

  const msg = `*************************
订单号：${order.tid}
亲亲，订单退款成功啦~
==========
火山加速非常期待与您的下次相遇。`;
  return _sendAliwwMsg(false, msg);
};

// 报错发送信息给用户
const _sendFailMessage = (message: string, tid: string) => {
  const msg = `订单号：${tid}\n${message}`;
  useSendReq("http://gw.api.agiso.com/alds/WwMsg/Send", { tid, msg });
};

// 生成返回信息
const _sendAliwwMsg = (send: boolean, AliwwMsg: string, Memo = "") => {
  return { DoDummySend: send, DoMemoUpdate: { Flag: 1, Memo }, AliwwMsg };
};
