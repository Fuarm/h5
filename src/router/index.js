import { createRouter, createWebHashHistory } from "vue-router";
import { useRouterGuardChain } from "@/hooks/useRouterGuardChain";
import { RouterException } from "@/utils/exception";
import systemRoutes from "./system.js";

const router = createRouter({
  history: createWebHashHistory(), // hash模式：createWebHashHistory，history模式：createWebHistory
  routes: [
    {
      path: "/",
      redirect: "/test1"
    },
    {
      path: "/test1", // 测试页面
      name: "test1",
      component: () => import("@/views/test/index.vue")
    },
    ...systemRoutes
  ]
});

const chain = useRouterGuardChain();

let latestNavigationId = 0;
let latestNavigationRouteName = null;
router.beforeEach(async (to) => {
  const navId = ++latestNavigationId; // 记录最新的导航 ID
  const routeState = await chain
    .start()
    .before(to, router)
    .then((chain) => chain.toast())
    .then((chain) => chain.authorization())
    .then((chain) => chain.end());

  latestNavigationRouteName = to.name;
  if (navId !== latestNavigationId) {
    return false; // 如果导航 ID 不匹配，终止
  }
  return routeState;
});

router.afterEach(async (to) => {
  if (to.name !== latestNavigationRouteName) return false;
  return await chain
    .start()
    .after(to, router)
    .then((chain) => chain.authorization())
    .then((chain) => chain.toast());
});

router.onError((error) => {
  chain
    .start()
    .after()
    .then((chain) => chain.toast());

  RouterException.asLog(error);
});

export default router;
