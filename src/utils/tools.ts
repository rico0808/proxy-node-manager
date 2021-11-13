import dayjs from "dayjs";

export const formatTime = (time: string) => dayjs(time).format("YYYY-MM-DD");

export const valid = (schema: any, body: any, required = true) => {
  const valid = required ? schema.required().safeParse(body) : schema.safeParse(body);
  if (!valid.success) throw [400, "参数不完整"];
  return schema.parse(body);
};
