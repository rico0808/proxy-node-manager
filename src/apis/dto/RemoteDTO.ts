import { z } from "zod";

export const ReportSign = z.object({
  time: z.string(),
  hash: z.string(),
});

export const ReportNodeInfo = ReportSign.extend({
  id: z.string(),
});

export const ReportTrafficBody = ReportSign.extend({
  id: z.string(),
  data: z.object({ account: z.string(), used: z.number() }).array(),
});
