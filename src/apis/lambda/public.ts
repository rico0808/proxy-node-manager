import { useEntityModel } from "@midwayjs/orm";
import { Users } from "../entity/Users";
import { z } from "zod";
import { UserInfoSchema } from "../dto/AuthDTO";
import { omit } from "lodash";
import { valid } from "../utils/tools";

const mUser = () => useEntityModel(Users);

export const pb_user_info = async (body: z.infer<typeof UserInfoSchema>) => {
  const data: z.infer<typeof UserInfoSchema> = valid(UserInfoSchema, body);
  const user = await mUser().findOne({ where: [{ account: data.account }, { tb: data.account }] });
  if (!user) throw [400, "用户不存在"];
  return omit(user, ["isAdmin"]);
};
