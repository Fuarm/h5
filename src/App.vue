<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script setup>
  console.log("APP VUE项目开始执行");
</script>
