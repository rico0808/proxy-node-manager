import { ApiConfig, useContext } from "@midwayjs/hooks-core";
import { Context } from "@midwayjs/koa";
import { useEntityModel } from "@midwayjs/orm";
import { z } from "zod";
import { valid } from "../../utils/tools";
import { CreateUserSchema, DelUserSchema, EditUserSchema } from "../dto/UserDTO";
import { Users } from "../entity/Users";
import { useFindCount } from "../hooks/Pagination";
import { AuthHandle } from "../middleware/AuthHandle";

export const config: ApiConfig = {
  middleware: [AuthHandle],
};

const ctx = () => useContext<Context>();
const mUser = () => useEntityModel(Users);

// id查找用户
const _findUserById = async (id: number) => {
  const user = await mUser().findOne({ where: { id } });
  if (!user) throw [401, "用户不存在"];
  return user;
};

// 用户列表
export const user_list = async ({ page = 1, size = 15 }) => {
  const [data, total] = await useFindCount(mUser, { isAdmin: 0 }, { page, size });
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
  user.traffic = data.traffic;
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
  user.used = data.used;
  user.traffic = data.traffic;
  user.expire = data.expire;
  user.useTest = data.useTest;
  user.status = data.status;
  await mUser().save(user);
  return { msg: "编辑用户成功" };
};
