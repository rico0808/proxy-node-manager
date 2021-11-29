import { z } from "zod";

export const OrderSchema = z.object({
  buyTime: z.string().nonempty(),
  createAt: z.string().nonempty(),
  id: z.number(),
  payment: z.string().nonempty(),
  product: z.any(),
  source: z.string().nonempty(),
  status: z.number(),
  tb: z.string().nonempty(),
  tid: z.string().nonempty(),
  uid: z.number(),
  updateAt: z.string().nonempty(),
});

export const OrderTidSchema = z.object({
  tid: z.string().nonempty(),
});
