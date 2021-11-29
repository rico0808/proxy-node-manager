import { ApiConfig } from "@midwayjs/hooks-core";
import { useEntityModel } from "@midwayjs/orm";
import dayjs from "dayjs";
import { z } from "zod";
import { OrderTidSchema } from "../dto/OrderDTO";
import { Goods } from "../entity/Goods";
import { Orders } from "../entity/Orders";
import { Users } from "../entity/Users";
import { useStaticTime } from "../hooks/agisoHook";
import { useFindCount } from "../hooks/Pagination";
import { useRefundGoods } from "../hooks/userHook";
import { AuthHandle } from "../middleware/AuthHandle";
import { valid } from "../utils/tools";

export const config: ApiConfig = { middleware: [AuthHandle] };

const mOrders = () => useEntityModel(Orders);
const mUsers = () => useEntityModel(Users);
const mGoods = () => useEntityModel(Goods);

const _findOrderByTid = async (body: any) => {
  const data: z.infer<typeof OrderTidSchema> = valid(OrderTidSchema, body);
  const order = await mOrders().findOne({ tid: data.tid });
  if (!order) throw [400, "订单不存在"];
  return order;
};

// 订单列表
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

  const refundGoods = JSON.parse(order.product).map((item) => ({ sku: item.OuterIid, num: item.Num }));
  await useRefundGoods(refundGoods, user);

  order.status = -1;
  await mOrders().save(order);
  return { msg: "订单退款完成", status: order.status };
};
