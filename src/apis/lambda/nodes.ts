import { ApiConfig, useContext } from "@midwayjs/hooks-core";
import { Context } from "@midwayjs/koa";
import { useEntityModel } from "@midwayjs/orm";
import { z } from "zod";
import { CreateNodeSchema, DelNodeSchema, EditNodeSchema } from "../dto/NodeDTO";
import { Nodes } from "../entity/Nodes";
import { useFindCount } from "../hooks/Pagination";
import { AuthHandle } from "../middleware/AuthHandle";
import { toGB, valid } from "../utils/tools";

export const config: ApiConfig = { middleware: [AuthHandle] };

const mNodes = () => useEntityModel(Nodes);

// id查找节点
const _findNodeById = async (id: number) => {
  const node = await mNodes().findOne({ where: { id } });
  if (!node) throw [401, "节点不存在"];
  return node;
};

// 节点列表
export const node_list = async ({ page = 1, size = 15 }) => {
  const [res, total] = await useFindCount(mNodes, {}, { page, size });
  const data = res.map((item) => {
    item.traffic = toGB(item.traffic);
    return item;
  });
  return { data, total };
};

// 新增节点
export const create_node = async (body: any) => {
  const data: z.infer<typeof CreateNodeSchema> = valid(CreateNodeSchema, body);
  const exist = await mNodes().findOne({ where: { ddns: data.ddns } });
  if (exist) throw [400, "节点地址已经存在"];
  const node = new Nodes();
  node.name = data.name;
  node.ddns = data.ddns;
  node.port = data.port;
  await mNodes().save(node);
  return { msg: "添加节点成功" };
};

// 删除节点
export const delete_node = async (body: any) => {
  const data: z.infer<typeof DelNodeSchema> = valid(DelNodeSchema, body);
  const node = await _findNodeById(data.id);
  await mNodes().remove(node);
  return { msg: "删除节点成功" };
};

// 编辑节点
export const edit_node = async (body: any) => {
  const data: z.infer<typeof EditNodeSchema> = valid(EditNodeSchema, body);
  const node = await _findNodeById(data.id);
  node.name = data.name;
  node.ddns = data.ddns;
  node.port = data.port;
  node.status = data.status;
  await mNodes().save(node);
  return { msg: "编辑节点成功" };
};

// 节点流量清空
export const clear_node_traffic = async (body: any) => {
  const data: z.infer<typeof DelNodeSchema> = valid(DelNodeSchema, body);
  const node = await _findNodeById(data.id);
  node.traffic = 0;
  await mNodes().save(node);
  return { msg: "节点流量清空成功" };
};
