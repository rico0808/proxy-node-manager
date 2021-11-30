import { useEntityModel } from "@midwayjs/orm";
import { Users } from "../entity/Users";
import { z } from "zod";
import { UserEditAccountSchema, UserInfoSchema } from "../dto/AuthDTO";
import { omit } from "lodash";
import { toGB, valid } from "../utils/tools";

const mUser = () => useEntityModel(Users);

export const pb_user_info = async (body: z.infer<typeof UserInfoSchema>) => {
  const data: z.infer<typeof UserInfoSchema> = valid(UserInfoSchema, body);
  const user = await mUser().findOne({ where: [{ account: data.account }, { tb: data.account }] });
  if (!user) throw [400, "用户不存在"];
  user.used = toGB(user.used);
  user.traffic = toGB(user.traffic);
  return omit(user, ["isAdmin", "tb"]);
};

// 用户编辑
export const pb_edit = async (body: z.infer<typeof UserEditAccountSchema>) => {
  const data: z.infer<typeof UserEditAccountSchema> = valid(UserEditAccountSchema, body);
  const user = await mUser().findOne({ where: [{ account: data.account }] });
  if (!user) throw [400, "用户不存在"];

  const has = await mUser().findOne({ where: [{ account: data.newAccount }] });
  if (has) throw [400, "该账号已经存在"];

  if (data.newAccount) user.account = data.newAccount;
  if (data.newPasswd) user.passwd = data.newPasswd;
  await mUser().save(user);
  return { msg: "修改成功" };
};
