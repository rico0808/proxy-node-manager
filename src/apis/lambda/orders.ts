import { useEntityModel } from "@midwayjs/orm";
import { Orders } from "../entity/Orders";
import { useFindCount } from "../hooks/Pagination";

const mOrders = () => useEntityModel(Orders);

// 节点列表
export const orders_list = async ({ page = 1, size = 15 }) => {
  const [res, total] = await useFindCount(mOrders, {}, { page, size });
  const data = res.map((item) => {
    item.product = JSON.parse(item.product);
    return item;
  });
  return { data, total };
};
