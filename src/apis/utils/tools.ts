import dayjs from "dayjs";

export const formatTime = (time: string, onTime = false) => {
  return onTime ? dayjs(time).format("YYYY-MM-DD HH:mm:ss") : dayjs(time).format("YYYY-MM-DD");
};

export const valid = (schema: any, body: any, required = true) => {
  const valid = required ? schema.required().safeParse(body) : schema.safeParse(body);
  if (!valid.success) throw [400, "参数不完整"];
  return schema.parse(body);
};

export const toByte = (val: number) => val * 1024 * 1024 * 1024;
export const toGB = (val: number) => parseFloat((val / 1024 / 1024 / 1024).toFixed(2));
