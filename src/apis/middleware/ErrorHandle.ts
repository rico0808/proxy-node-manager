import { useContext } from "@midwayjs/hooks-core";
import { Context } from "koa";

export const ErrorHandle = async (next: any) => {
  const ctx = useContext<Context>();
  try {
    await next();
  } catch (error) {
    if (Array.isArray(error)) {
      const [status, msg] = error;
      ctx.status = status || 500;
      ctx.body = { msg };
    } else {
      ctx.status = 500;
      ctx.body = { msg: "服务器内部错误" };
      console.log(error.message);
    }
  }
};
