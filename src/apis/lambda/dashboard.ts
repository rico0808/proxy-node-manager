import { ApiConfig } from "@midwayjs/hooks-core";
import { useEntityModel } from "@midwayjs/orm";
import dayjs from "dayjs";
import { Orders } from "../entity/Orders";
import { Users } from "../entity/Users";
import { AuthHandle } from "../middleware/AuthHandle";

export const config: ApiConfig = { middleware: [AuthHandle] };

const mUsers = () => useEntityModel(Users);
const mOrders = () => useEntityModel(Orders);

export const income_about = async () => {
  const toDay = dayjs().format("YYYY-MM-DD");
  const orders = await mOrders()
    .createQueryBuilder("order")
    .where("order.buyTime LIKE :buyTime", { buyTime: `%${toDay}%` })
    .getMany();

  const newUsers = await mUsers()
    .createQueryBuilder("user")
    .where("user.createAt LIKE :createAt", { createAt: `%${toDay}%` })
    .andWhere("user.isAdmin = 0")
    .getMany();
  const newOrder = orders.filter((item) => item.status === 2);
  const newRefund = orders.filter((item) => item.status === -1);

  let orderPayment = 0;
  newOrder.forEach((item) => (orderPayment += parseFloat(item.payment)));
  let refundPayment = 0;
  newRefund.forEach((item) => (refundPayment += parseFloat(item.payment)));
  return {
    order: newOrder.length,
    orderPayment,
    refund: newRefund.length,
    refundPayment,
    user: newUsers.length,
  };
};
