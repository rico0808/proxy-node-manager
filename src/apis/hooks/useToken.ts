import { IF_JwtSignPayload } from "../interface";
import { sign, verify } from "jsonwebtoken";
import { useConfig } from "@midwayjs/hooks-core";

export class useToken {
  // 生成token
  static Sign(payload: IF_JwtSignPayload) {
    const config = useConfig();
    return sign(payload, config.JwtSecret, { expiresIn: "12h" });
  }

  // 验证token
  static async Verify(authorization: string) {
    const config = useConfig();
    const token = authorization.split(" ")[1];
    try {
      return verify(token, config.JwtSecret);
    } catch {
      throw [401, "Authorization Expire"];
    }
  }
}
