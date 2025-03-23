import { createApp } from "vue";
import router from "@/router";
import pinia from "@/store";

import App from "@/App.vue";

console.log("项目开始执行");

createApp(App).use(pinia).use(router).mount("#app");
