import { ApiConfig } from "@midwayjs/hooks-core";
import { useEntityModel } from "@midwayjs/orm";
import { z } from "zod";
import { CreateGoodsSchema, DelGoodsSchema, EditGoodsSchema } from "../dto/GoodsDTO";
import { Goods } from "../entity/Goods";
import { useFindCount } from "../hooks/Pagination";
import { AuthHandle } from "../middleware/AuthHandle";
import { toGB, toByte, valid } from "../utils/tools";

export const config: ApiConfig = { middleware: [AuthHandle] };

const mGoods = () => useEntityModel(Goods);

// id查找
const _findGoodsById = async (id: number) => {
  const goods = await mGoods().findOne({ where: { id } });
  if (!goods) throw [401, "节点不存在"];
  return goods;
};

// 商品列表
export const goods_list = async ({ page = 1, size = 15 }) => {
  const [res, total] = await useFindCount(mGoods, {}, { page, size });
  const data = res.map((item) => {
    item.traffic = toGB(item.traffic);
    return item;
  });
  return { data, total };
};

// 新增商品
export const create_goods = async (body: any) => {
  const data: z.infer<typeof CreateGoodsSchema> = valid(CreateGoodsSchema, body);
  const exist = await mGoods().findOne({ where: { sku: data.sku } });
  if (exist) throw [400, "SKU编号已经存在"];
  const goods = new Goods();
  goods.name = data.name;
  goods.sku = data.sku;
  goods.traffic = toByte(data.traffic);
  goods.days = data.days;
  await mGoods().save(goods);
  return { msg: "添加商品成功" };
};

// 删除商品
export const delete_goods = async (body: any) => {
  const data: z.infer<typeof DelGoodsSchema> = valid(DelGoodsSchema, body);
  const goods = await _findGoodsById(data.id);
  await mGoods().remove(goods);
  return { msg: "删除商品成功" };
};

// 编辑商品
export const edit_goods = async (body: any) => {
  const data: z.infer<typeof EditGoodsSchema> = valid(EditGoodsSchema, body);
  const goods = await _findGoodsById(data.id);
  goods.name = data.name;
  goods.sku = data.sku;
  goods.traffic = toByte(data.traffic);
  goods.days = data.days;
  goods.status = data.status;
  await mGoods().save(goods);
  return { msg: "编辑商品成功" };
};

// 全部商品无分页
export const goods_list_nopage = async () => await mGoods().find();
