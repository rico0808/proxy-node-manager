import { useContext } from "@midwayjs/hooks-core";
import { JwtPayload } from "jsonwebtoken";
import { Context } from "koa";
import { useToken } from "../hooks/useToken";

export const AuthHandle = async (next: any) => {
  const ctx = useContext<Context>();
  if (!ctx.headers.authorization) throw [401, "Unknown Authorization"];
  const payload = (await useToken.Verify(ctx.headers.authorization)) as JwtPayload;
  // 判断用户权限
  if (payload.isAdmin !== 1) throw [401, "Permissions Error"];
  ctx.session = payload;
  await next();
};
