import { z } from "zod";

export const LoginSchema = z.object({
  account: z.string().nonempty(),
  passwd: z.string().nonempty(),
});

export const UserInfoSchema = z.object({
  account: z.string().nonempty(),
});
