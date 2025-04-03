<script setup></script>

<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive>
      <component
        :is="Component"
        v-if="route.meta.keepAlive"
        :key="route.path + JSON.stringify(route.query)"
      >
        />
      </component>
    </keep-alive>
    <component
      :is="Component"
      v-if="!route.meta.keepAlive"
      :key="route.path + JSON.stringify(route.query)"
    />
  </router-view>
</template>
