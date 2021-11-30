import { z } from "zod";

export const LoginSchema = z.object({
  account: z.string().nonempty(),
  passwd: z.string().nonempty(),
});

export const UserInfoSchema = z.object({
  account: z.string().nonempty(),
});

export const UserEditAccountSchema = z.object({
  account: z.string().nonempty(),
  newAccount: z.string().nullish(),
  newPasswd: z.string().nullish(),
});
