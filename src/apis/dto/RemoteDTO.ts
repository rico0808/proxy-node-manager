import { z } from "zod";

export const ReportSign = z.object({
  time: z.string(),
  hash: z.string(),
});

export const ReportNodeInfo = ReportSign.extend({
  id: z.number(),
});

export const ReportTrafficBody = ReportSign.extend({
  id: z.number(),
  data: z.object({ account: z.string(), used: z.number() }).array(),
});
