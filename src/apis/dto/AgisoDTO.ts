import { z } from "zod";

export const AgisoQuerySchema = z.object({
  aopic: z.string().nonempty(),
  timestamp: z.string().nonempty(),
  sign: z.string().nonempty(),
  fromPlatform: z.string().nonempty(),
});

export const AgisoBodySchema = z.object({
  json: z.string().nonempty(),
});
