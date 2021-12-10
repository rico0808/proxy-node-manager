import { useEntityModel } from "@midwayjs/orm";
import dayjs from "dayjs";
import { Nodes } from "../entity/Nodes";

const mNodes = () => useEntityModel(Nodes);

// 最小负载节点
export const useFreeNode = async () => {
  const nodeRes = await mNodes().find({ order: { online: "ASC" }, where: { status: 1 } });
  const time = dayjs().subtract(1, "minute").toISOString();
  const node = nodeRes.filter((item) => dayjs(item.report).isAfter(time))[0];
  return node ? node : false;
};
