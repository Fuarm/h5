<script setup>
  import { ref } from "vue";
  import sha256 from "sha256";
  import { useUserStore } from "@/store/useUserStore.js";

  const { login } = useUserStore();

  const account = ref("");
  const password = ref("");

  const loading = ref(false);

  const submit = () => {
    loading.value = true;
    login({
      account: account.value,
      password: sha256(password.value)
    }).finally(() => {
      loading.value = false;
    });
  };
</script>

<template>
  <div class="">
    <van-field v-model="account" label="账号" placeholder="请输入账号" />
    <van-field v-model="password" label="密码" placeholder="请输入密码" />
    <van-button type="primary" :loading="loading" @click="submit">登录</van-button>
  </div>
</template>
