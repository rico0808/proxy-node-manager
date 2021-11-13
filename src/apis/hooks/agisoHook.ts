import { useConfig } from "@midwayjs/hooks-core";
import { MD5 } from "crypto-js";
import dayjs from "dayjs";
import { stringify } from "querystring";
import axios from "axios";
import { AgisoBodySchema, AgisoQuerySchema } from "../dto/AgisoDTO";
import { z } from "zod";

export const useVerifySign = async (query: z.infer<typeof AgisoQuerySchema>, body: z.infer<typeof AgisoBodySchema>) => {
  const { sign, timestamp } = query;
  const config = useConfig();
  const str = `${config.agisoSecret}json${body.json}timestamp${timestamp}${config.agisoSecret}`;
  return MD5(str).toString().toUpperCase() === sign;
};

export const useRandom = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

export const useStaticTime = (time = "") => {
  if (time) {
    const date = `${dayjs(time).format("YYYY-MM-DD")} 08:00:00`;
    return dayjs(date).toISOString();
  } else {
    const date = `${dayjs().format("YYYY-MM-DD")} 08:00:00`;
    return dayjs(date).toISOString();
  }
};

export const useWwMsg = () => `
*************************
订单号：{tid}
亲亲，订单已经发货成功啦~
==========
服务器：{ip}
端口：{port}
用户名：{account}
密码：{passwd}
==========
!!!注意事项!!!
① 下载完成请关闭【代理服务器设置】否则会影响NS正常使用
② 流量用完或到期，下载会出现【已暂停】请及时续充或关闭`;

export const useSendReq = async (url: string, data: any) => {
  const token = useConfig("agisoToken");

  const { sign, timestamp } = await useGetSign(data);
  const payload = stringify(Object.assign({}, data, { timestamp, sign }));
  return await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      ApiVersion: "1",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

// 签名
const useGetSign = async (data: any) => {
  const timestamp = dayjs().unix().toString();
  const secret = useConfig("agisoSecret");
  data.timestamp = timestamp;
  const obj = useKSort(data);
  let str = "";
  for (const key in obj) {
    str += key + obj[key];
  }
  const sign = MD5(secret + str + secret).toString();
  return { sign: sign.toUpperCase(), timestamp };
};

// 对象按key排序
export const useKSort = (data: any) => {
  const sorted = {};
  const keys = Object.keys(data);
  keys.sort();
  keys.forEach((key) => (sorted[key] = data[key]));
  return sorted;
};
