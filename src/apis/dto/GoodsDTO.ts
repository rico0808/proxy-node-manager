import { z } from "zod";

export const CreateGoodsSchema = z.object({
  name: z.string().nonempty(),
  sku: z.string().nonempty(),
  traffic: z.number(),
  days: z.number(),
});

export const DelGoodsSchema = z.object({
  id: z.number(),
});

export const EditGoodsSchema = z.object({
  id: z.number(),
  name: z.string().nonempty(),
  sku: z.string().nonempty(),
  traffic: z.number(),
  days: z.number(),
  status: z.number(),
});
