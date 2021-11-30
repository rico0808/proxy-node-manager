import { useEntityModel } from "@midwayjs/orm";
import { z } from "zod";
import { CreateNoticeSchema, DelNoticeSchema, EditNoticeSchema } from "../dto/NoticeDTO";
import { Notices } from "../entity/Notices";
import { useFindCount } from "../hooks/Pagination";
import { valid } from "../utils/tools";

const mNotice = () => useEntityModel(Notices);

// 通知列表
export const notice_list = async ({ page = 1, size = 15 }) => {
  const [data, total] = await useFindCount(mNotice, {}, { page, size });
  return { data, total };
};

// 新增通知
export const create_notice = async (body: any) => {
  const data: z.infer<typeof CreateNoticeSchema> = valid(CreateNoticeSchema, body);
  const notice = new Notices();
  notice.title = data.title || null;
  notice.content = data.content;
  notice.status = 1;
  await mNotice().save(notice);
  return { msg: "添加公告成功" };
};

// 删除通知
export const delete_notice = async (body: any) => {
  const data: z.infer<typeof DelNoticeSchema> = valid(DelNoticeSchema, body);
  const notice = await mNotice().findOne({ where: { id: data.id } });
  await mNotice().remove(notice);
  return { msg: "删除公告成功" };
};

// 编辑通知
export const edit_notice = async (body: any) => {
  const data: z.infer<typeof EditNoticeSchema> = valid(EditNoticeSchema, body);
  const notice = await mNotice().findOne({ where: { id: data.id } });
  notice.title = data.title;
  notice.content = data.content;
  notice.type = data.type;
  notice.status = data.status;
  await mNotice().save(notice);
  return { msg: "编辑公告成功" };
};
