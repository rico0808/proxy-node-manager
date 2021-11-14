import dayjs from "dayjs";

export const formatTime = (time: string, onTime = false) => {
  return onTime ? dayjs(time).format("YYYY-MM-DD HH:mm:ss") : dayjs(time).format("YYYY-MM-DD");
};
