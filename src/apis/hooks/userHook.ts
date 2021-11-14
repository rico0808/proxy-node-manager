import { useEntityModel } from "@midwayjs/orm";
import dayjs from "dayjs";
import { Goods } from "../entity/Goods";
import { Users } from "../entity/Users";
import { IF_UseProductData } from "../interface";
import { useStaticTime } from "./agisoHook";

const mGoods = () => useEntityModel(Goods);
const mUsers = () => useEntityModel(Users);

export const useGoods = async (data: IF_UseProductData[], user: Users) => {
  for (let i = 0; i < data.length; i++) {
    const { sku, num } = data[i];
    const prod = await mGoods().findOne({ where: { sku } });
    if (!prod) return Promise.reject("SKU不存在" + sku);

    // 流量充值
    const traffic = prod.traffic * num;
    const days = prod.days * num;
    user.traffic += traffic;
    if (dayjs().isAfter(user.expire)) {
      user.expire = useStaticTime(dayjs().add(days, "day").toISOString());
    } else {
      user.expire = useStaticTime(dayjs(user.expire).add(days, "day").toISOString());
    }

    // 销量增加
    prod.sales += num;
    await mGoods().save(prod);
  }
  return await mUsers().save(user);
};
