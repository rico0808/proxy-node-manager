import { createRouter, createWebHistory } from "vue-router";
import _ls from "../utils/_ls";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: () => import("../views/public/User.vue"),
      meta: { unAuth: true, public: true },
    },
    {
      path: "/manager/auth",
      component: () => import("../views/manager/Auth.vue"),
      meta: { unAuth: true },
    },
    {
      path: "/manager",
      component: () => import("../component/Layout.vue"),
      children: [
        { path: "", component: () => import("../views/manager/Dashboard.vue") },
        { path: "users", component: () => import("../views/manager/Users.vue") },
        { path: "nodes", component: () => import("../views/manager/Nodes.vue") },
        { path: "goods", component: () => import("../views/manager/Goods.vue") },
        { path: "notices", component: () => import("../views/manager/Notices.vue") },
        { path: "orders", component: () => import("../views/manager/Orders.vue") },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = _ls.Get("token");
  if (to.meta.unAuth && to.meta.public) return next();
  if (to.meta.unAuth) {
    if (token) return next("/manager");
    return next();
  }
  if (token) return next();
  return next({ path: "/manager/auth" });
});

export default router;
