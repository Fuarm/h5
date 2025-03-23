import { defineStore } from "pinia";
import { shallowRef } from "vue";

export const useUserStore = defineStore("user", () => {
  // 用户信息
  const userInfo = shallowRef({});

  // 登录
  const login = () => {};
  //登出
  const logout = () => {};

  return {
    userInfo,
    login,
    logout
  };
});
