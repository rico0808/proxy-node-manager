import { ApiConfig } from "@midwayjs/hooks-core";
import { useEntityModel } from "@midwayjs/orm";
import { z } from "zod";
import { OrderTidSchema } from "../dto/OrderDTO";
import { Orders } from "../entity/Orders";
import { useFindCount } from "../hooks/Pagination";
import { AuthHandle } from "../middleware/AuthHandle";
import { valid } from "../utils/tools";

export const config: ApiConfig = { middleware: [AuthHandle] };

const mOrders = () => useEntityModel(Orders);

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
