import { useEntityModel } from "@midwayjs/orm";
import { Users } from "../entity/Users";
import { useToken } from "../hooks/useToken";
import { omit } from "lodash";
import { z } from "zod";
import { LoginSchema } from "../dto/AuthDTO";
import { withController } from "@midwayjs/hooks";
import { AuthHandle } from "../middleware/AuthHandle";
import { Context } from "koa";
import { useContext } from "@midwayjs/hooks-core";
import { valid } from "../../utils/tools";

const ctx = () => useContext<Context>();
const mUser = () => useEntityModel(Users);

export const user_login = async (body: z.infer<typeof LoginSchema>) => {
  const data = valid(LoginSchema, body);
  const user = await mUser().findOne({ where: { account: data.account, status: 1, isAdmin: 1 } });
  if (!user) throw [400, "登录账号不存在"];
  if (data.passwd !== user.passwd) throw [400, "登录密码错误"];
  const token = useToken.Sign({ id: user.id, account: user.account, status: user.status, isAdmin: user.isAdmin });
  return Object.assign(omit(user, ["passwd"]), { token });
};

export const user_info = withController({ middleware: [AuthHandle] }, async () => {
  const { session } = ctx();
  const user = await mUser().findOne({ where: { id: session.id } });
  if (!user) throw [401, "User Session Expire"];
  return omit(user, ["passwd"]);
});
