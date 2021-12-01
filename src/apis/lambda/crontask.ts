import { useEntityModel } from "@midwayjs/orm";
import dayjs from "dayjs";
import { Users } from "../entity/Users";

const mUsers = () => useEntityModel(Users);

// 定时任务
export const loop = async () => {
  const users = await mUsers().find();
  let expireNum = 0;
  let clearTest = 0;
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    // 判断过期清空流量
    if (dayjs().isAfter(user.expire)) {
      user.traffic = user.used = 0;
      expireNum += 1;
    }

    // 判断试用超过30天重置试用
    if (user.useTest === 1 && user.testTime) {
      const before30 = dayjs().subtract(30, "day").toISOString();
      if (dayjs(before30).isAfter(user.testTime)) {
        user.useTest = 0;
        clearTest += 1;
      }
    }
    if (expireNum || clearTest) await mUsers().save(user);
  }

  return { msg: `自动任务执行成功 | 过期：${expireNum} | 重置试用：${clearTest} -->> ${dayjs().format("YYYY-MM-DD HH:mm:ss")}` };
};
