import { z } from "zod";

export const CreateNoticeSchema = z.object({
  title: z.string().nullish(),
  content: z.string().nonempty(),
  type: z.string().nonempty(),
  status: z.number(),
});

export const DelNoticeSchema = z.object({
  id: z.number(),
});

export const EditNoticeSchema = DelNoticeSchema.merge(CreateNoticeSchema);
