import { message } from "ant-design-vue";
import axios from "axios";
import router from "../routes";
import _ls from "../utils/_ls";

const mFetch = axios.create({
  timeout: 5 * 1000,
});

mFetch.interceptors.request.use(
  (config) => {
    const token = _ls.Get("token") || null;
    if (token) config.headers["authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

mFetch.interceptors.response.use(
  (res) => {
    if (res.data.token) _ls.Set("token", res.data.token);
    return res.data;
  },
  (error) => {
    const { status, data } = error.response;
    if (status === 401) {
      _ls.Clear();
      return router.push("/manager/auth");
    }
    message.error(data.msg || "远程服务器错误");
    return Promise.reject(error.response.data);
  }
);

export default mFetch;
