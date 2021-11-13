import { z } from "zod";

export const LoginSchema = z.object({
  account: z.string().nonempty(),
  passwd: z.string().nonempty(),
});
