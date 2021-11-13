import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import router from "./routes";
import "ant-design-vue/dist/antd.css";
import "./assets/scss/base.scss";

// 更改默认请求SDK
import { defaults, ApiParam } from "@midwayjs/hooks/request";
import mFetch from "./plugins/mFetch";
defaults.request = async (params: ApiParam) => await mFetch(params);

const app = createApp(App);
app.use(router);
app.mount("#app");
