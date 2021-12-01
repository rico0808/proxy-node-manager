import { useContext } from "@midwayjs/hooks-core";
import { useEntityModel } from "@midwayjs/orm";
import { MD5 } from "crypto-js";
import dayjs from "dayjs";
import { Context } from "koa";
import { z } from "zod";
import { ReportNodeInfo, ReportSign, ReportTrafficBody } from "../dto/RemoteDTO";
import { Nodes } from "../entity/Nodes";
import { Users } from "../entity/Users";
import { valid } from "../utils/tools";

const ctx = () => useContext<Context>();
const mUsers = () => useEntityModel(Users);
const mNodes = () => useEntityModel(Nodes);

// 验证hash
const _verifyHash = (body: z.infer<typeof ReportSign>) => {
  const str = "ohUqfbWUYzQQDcLD";
  const hash = MD5(body.time + str).toString();
  if (hash !== body.hash) throw [400, "签名验证错误"];
};

// 获取节点信息
export const node_info = async () => {
  const body: z.infer<typeof ReportNodeInfo> = valid(ReportNodeInfo, ctx().request.body);
  _verifyHash(body);
  const node = await mNodes().findOne({ where: { id: body.id } });
  if (!node) throw [400, "节点ID不存在"];
  return node;
};

// 获取有效用户
export const valid_user_list = async () => {
  const body: z.infer<typeof ReportSign> = valid(ReportSign, ctx().request.body);
  _verifyHash(body);
  const users = await mUsers().createQueryBuilder("user").where("user.used < user.traffic").andWhere("user.status = 1").getMany();
  const data: { [key: string]: string } = {};
  users.forEach((item) => (data[item.account] = item.passwd));
  return data;
};

// 流量上报
export const report_traffic = async () => {
  const body: z.infer<typeof ReportTrafficBody> = valid(ReportTrafficBody, ctx().request.body);
  _verifyHash(body);
  const { id, data } = body;

  const node = await mNodes().findOne({ where: { id } });
  if (!node) throw [400, `#${id} 节点不存在`];

  if (data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      const { account, used } = data[i];
      // 节点流量
      const node_traffic = parseInt(node.traffic as any);
      node.traffic = node_traffic + used;

      // 用户流量
      const user = await mUsers().findOne({ where: { account } });
      if (!user) continue;
      const user_traffic = parseInt(user.used as any);
      user.used = user_traffic + used;
      user.lastUse = dayjs().toISOString();
      await mUsers().save(user);
    }
    node.online = data.length;
  }
  node.report = new Date().toISOString();
  await mNodes().save(node);
  return { msg: `#${id} 节点上报流量完毕 ${dayjs().format("YYYY-MM-DD HH:mm:ss")}` };
};
