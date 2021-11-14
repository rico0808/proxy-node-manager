import { useEntityModel } from "@midwayjs/orm";
import dayjs from "dayjs";
import { z } from "zod";
import { valid } from "../../utils/tools";
import { OrderTidSchema } from "../dto/OrderDTO";
import { Goods } from "../entity/Goods";
import { Orders } from "../entity/Orders";
import { Users } from "../entity/Users";
import { useStaticTime } from "../hooks/agisoHook";
import { useFindCount } from "../hooks/Pagination";

const mOrders = () => useEntityModel(Orders);
const mUsers = () => useEntityModel(Users);
const mGoods = () => useEntityModel(Goods);

const _findOrderByTid = async (body: any) => {
  const data: z.infer<typeof OrderTidSchema> = valid(OrderTidSchema, body);
  const order = await mOrders().findOne({ tid: data.tid });
  if (!order) throw [400, "订单不存在"];
  return order;
};

// 节点列表
export const orders_list = async ({ page = 1, size = 15 }) => {
  const [res, total] = await useFindCount(mOrders, {}, { page, size });
  const data = res.map((item) => {
    item.product = JSON.parse(item.product);
    return item;
  });
  return { data, total };
};

// 单个订单信息
export const find_order = async (body: any) => {
  const order = await _findOrderByTid(body);
  //订单状态 0未知 1已付款 2已发货 -1退款
  if (order.status === 0) throw [400, "订单状态未知，无法操作"];
  return order;
};

// 订单退款
export const refund_order = async (body: any) => {
  const order = await _findOrderByTid(body);
  const user = await mUsers().findOne({ tb: order.tb });
  if (!user) throw [400, "用户已被删除"];

  // 清空订单流量
  const products: [{ OuterIid: string; Num: number }] = JSON.parse(order.product);
  for (let i = 0; i < products.length; i++) {
    const { OuterIid: sku, Num: num } = products[i];
    const good = await mGoods().findOne({ where: { sku } });
    if (!good) continue;
    user.traffic -= good.traffic * num;
    user.expire = useStaticTime(
      dayjs(user.expire)
        .subtract(good.days * num, "day")
        .toISOString()
    );
    await mUsers().save(user);
  }
  order.status = -1;
  await mOrders().save(order);
  return { msg: "订单退款完成", status: order.status };
};
