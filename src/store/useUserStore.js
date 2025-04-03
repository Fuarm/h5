import { defineStore } from "pinia";
import { useRoute, useRouter } from "vue-router";

export const useUserStore = defineStore("user", () => {
  const router = useRouter(); // 获取 router
  const route = useRoute();

  // 用户信息
  let userInfo = null;

  // 登录
  const login = async () => {
    // 清除sessionStorage缓存, 确保使用最新数据
    sessionStorage.clear();
    // const response = await loginByAccount(data);
    // userInfo = await queryUserInfo();
    await router.replace(route.redirectedFrom ?? "/");
  };

  //登出
  const logout = async () => {
    // const response = await logoutByAccount(data);
    userInfo = null;
    sessionStorage.clear();
    await router.replace("/");
  };

  const getUserInfo = async () => {
    if (userInfo) {
      return userInfo;
    }
    // userInfo = await queryUserInfo();
    return userInfo;
  };

  return {
    getUserInfo,
    login,
    logout
  };
});
