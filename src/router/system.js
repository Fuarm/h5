export default [
  {
    // 登录页
    path: "/login",
    name: "login",
    component: () => import("@/views/system/login/index.vue")
  },
  {
    // 通配符添加404页面，解决刷新浏览器报警告 No match found for location with path
    hide: true,
    path: "/:pathMatch(.*)*",
    component: () => import(/* webpackChunkName: "temp" */ "@/views/system/error/404.vue")
  }
];
