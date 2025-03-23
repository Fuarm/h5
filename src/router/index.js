import { createRouter, createWebHashHistory } from "vue-router";
import { useRouterGuardChain } from "@/hooks/useRouterGuardChain";
import { RouterException } from "@/uitls/exception";

const router = createRouter({
  history: createWebHashHistory(), // hash模式：createWebHashHistory，history模式：createWebHistory
  routes: [
    {
      path: "/",
      redirect: "/login"
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/system/login/index.vue")
    }
  ]
});

const chain = useRouterGuardChain();

let latestNavigationId = 0;
let latestNavigationRouteName = null;
router.beforeEach(async (to) => {
  console.log("Route 前置项目开始执行", to);
  const navId = ++latestNavigationId; // 记录最新的导航 ID
  const routeState = await chain
    .start()
    .before(to, router)
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
    .then((chain) => chain.end());
});

router.onError((error) => {
  RouterException.asLog(error);
});

export default router;
