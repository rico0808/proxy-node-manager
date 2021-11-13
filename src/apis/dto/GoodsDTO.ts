import { z } from "zod";

export const CreateGoodsSchema = z.object({
  name: z.string().nonempty(),
  sku: z.string().nonempty(),
});

export const DelGoodsSchema = z.object({
  id: z.number(),
});

export const EditGoodsSchema = z.object({
  id: z.number(),
  name: z.string().nonempty(),
  sku: z.string().nonempty(),
  status: z.number(),
});
