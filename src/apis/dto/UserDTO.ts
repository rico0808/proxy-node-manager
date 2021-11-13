import { z } from "zod";

export const CreateUserSchema = z.object({
  tb: z.string().nonempty(),
  account: z.string().nonempty(),
  passwd: z.string().nonempty(),
  traffic: z.number().default(0),
  expire: z.string().nonempty(),
});

export const EditUserSchema = z.object({
  id: z.number(),
  account: z.string().nonempty(),
  passwd: z.string().nonempty(),
  used: z.number().default(0),
  traffic: z.number().default(0),
  expire: z.string().nonempty(),
  useTest: z.number(),
  status: z.number(),
});

export const DelUserSchema = z.object({
  id: z.number(),
});
