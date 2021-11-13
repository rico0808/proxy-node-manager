import { ApiConfig, useContext } from "@midwayjs/hooks-core";
import { Context } from "@midwayjs/koa";
import { useEntityModel } from "@midwayjs/orm";
import { z } from "zod";
import { valid } from "../../utils/tools";
import { CreateGoodsSchema, DelGoodsSchema, EditGoodsSchema } from "../dto/GoodsDTO";
import { Goods } from "../entity/Goods";
import { useFindCount } from "../hooks/Pagination";
import { AuthHandle } from "../middleware/AuthHandle";

export const config: ApiConfig = { middleware: [AuthHandle] };

const ctx = () => useContext<Context>();
const mGoods = () => useEntityModel(Goods);

// id查找用户
const _findNodeById = async (id: number) => {
  const user = await mGoods().findOne({ where: { id } });
  if (!user) throw [401, "节点不存在"];
  return user;
};

// 节点列表
export const goods_list = async ({ page = 1, size = 15 }) => {
  const [data, total] = await useFindCount(mGoods, {}, { page, size });
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
  await mGoods().save(goods);
  return { msg: "添加商品成功" };
};

// 删除商品
export const delete_goods = async (body: any) => {
  const data: z.infer<typeof DelGoodsSchema> = valid(DelGoodsSchema, body);
  const goods = await _findNodeById(data.id);
  await mGoods().remove(goods);
  return { msg: "删除商品成功" };
};

// 编辑商品
export const edit_goods = async (body: any) => {
  const data: z.infer<typeof EditGoodsSchema> = valid(EditGoodsSchema, body);
  const goods = await _findNodeById(data.id);
  goods.name = data.name;
  goods.sku = data.sku;
  goods.status = data.status;
  await mGoods().save(goods);
  return { msg: "编辑商品成功" };
};
