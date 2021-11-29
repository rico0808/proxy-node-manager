import { ApiConfig, useContext } from "@midwayjs/hooks-core";
import { Context } from "@midwayjs/koa";
import { useEntityModel } from "@midwayjs/orm";
import { z } from "zod";
import { CreateUserSchema, DelUserSchema, EditUserSchema, FindUserSchema, UserAddGoodsSchema } from "../dto/UserDTO";
import { Goods } from "../entity/Goods";
import { Users } from "../entity/Users";
import { useFindCount } from "../hooks/Pagination";
import { useGoods } from "../hooks/userHook";
import { AuthHandle } from "../middleware/AuthHandle";
import { toGB, toByte, valid } from "../utils/tools";

export const config: ApiConfig = { middleware: [AuthHandle] };

const ctx = () => useContext<Context>();
const mUser = () => useEntityModel(Users);
const mGoods = () => useEntityModel(Goods);

// id查找用户
const _findUserById = async (id: number) => {
  const user = await mUser().findOne({ where: { id } });
  if (!user) throw [401, "用户不存在"];
  return user;
};

// 用户列表
export const user_list = async ({ page = 1, size = 15 }) => {
  const [res, total] = await useFindCount(mUser, { isAdmin: 0 }, { page, size });
  const data = res.map((item) => {
    item.traffic = toGB(item.traffic);
    item.used = toGB(item.used);
    return item;
  });
  return { data, total };
};

// 新增用户
export const create_user = async (body: any) => {
  const data: z.infer<typeof CreateUserSchema> = valid(CreateUserSchema, body);
  const tbExist = await mUser().findOne({ where: { tb: data.tb } });
  if (tbExist) throw [400, "淘宝账号已经存在"];
  const AccountExist = await mUser().findOne({ where: { account: data.account } });
  if (AccountExist) throw [400, "连接账号已经存在"];
  const user = new Users();
  user.tb = data.account;
  user.account = data.account;
  user.passwd = data.passwd;
  user.traffic = toByte(data.traffic);
  user.expire = data.expire;
  await mUser().save(user);
  return { msg: "创建用户成功" };
};

// 删除用户
export const delete_user = async (body: any) => {
  const data: z.infer<typeof DelUserSchema> = valid(DelUserSchema, body);
  const user = await _findUserById(data.id);
  await mUser().remove(user);
  return { msg: "删除用户成功" };
};

// 编辑用户
export const edit_user = async (body: any) => {
  const data: z.infer<typeof EditUserSchema> = valid(EditUserSchema, body);
  const user = await _findUserById(data.id);
  user.account = data.account;
  user.passwd = data.passwd;
  user.used = toByte(data.used);
  user.traffic = toByte(data.traffic);
  user.expire = data.expire;
  user.useTest = data.useTest;
  user.status = data.status;
  await mUser().save(user);
  return { msg: "编辑用户成功" };
};

// 查找用户
export const find_user = async (body: any) => {
  const data: z.infer<typeof FindUserSchema> = valid(FindUserSchema, body);
  const user = await mUser().findOne({
    where: [
      { account: data.account, isAdmin: 0 },
      { tb: data.account, isAdmin: 0 },
    ],
  });
  if (!user) throw [400, "用户不存在"];
  user.used = toGB(user.used);
  user.traffic = toGB(user.traffic);
  return user;
};

// 重置试用
export const reset_user_test = async (body: any) => {
  const data: z.infer<typeof DelUserSchema> = valid(DelUserSchema, body);
  const user = await _findUserById(data.id);
  user.useTest = 0;
  await mUser().save(user);
  return { msg: "重置试用成功", useTest: user.useTest };
};

// 流量清空
export const reset_user_used = async (body: any) => {
  const data: z.infer<typeof DelUserSchema> = valid(DelUserSchema, body);
  const user = await _findUserById(data.id);
  user.used = 0;
  await mUser().save(user);
  return { msg: "清空流量成功", used: user.used };
};

// 封禁账户
export const block_user = async (body: any) => {
  const data: z.infer<typeof DelUserSchema> = valid(DelUserSchema, body);
  const user = await _findUserById(data.id);
  user.status = 0;
  await mUser().save(user);
  return { msg: "封禁账户成功", status: 0 };
};

// 启用账户
export const unlock_user = async (body: any) => {
  const data: z.infer<typeof DelUserSchema> = valid(DelUserSchema, body);
  const user = await _findUserById(data.id);
  user.status = 1;
  await mUser().save(user);
  return { msg: "启用账户成功", status: 1 };
};

// 商品补单
export const user_add_goods = async (body: any) => {
  const data: z.infer<typeof UserAddGoodsSchema> = valid(UserAddGoodsSchema, body);
  const user = await _findUserById(data.id);
  const goods = await mGoods().findOne({ where: { sku: data.sku } });
  if (!goods) throw [400, "商品不存在"];
  await useGoods([{ sku: goods.sku, num: 1 }], user);
  return { msg: "商品补单成功" };
};
