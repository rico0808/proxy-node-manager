import { z } from "zod";

export const CreateNodeSchema = z.object({
  name: z.string().nonempty(),
  ddns: z.string().nonempty(),
  port: z.string().nonempty(),
});

export const DelNodeSchema = z.object({
  id: z.number(),
});

export const EditNodeSchema = z.object({
  id: z.number(),
  name: z.string().nonempty(),
  ddns: z.string().nonempty(),
  port: z.string().nonempty(),
  status: z.number(),
});
