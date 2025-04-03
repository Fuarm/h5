import { createApp } from "vue";
import router from "@/router";
import store from "@/store";
import { globalExceptionHandle } from "@/utils/exception.js";
import directives from "@/directives/index.js";

import App from "./App.vue";

// 引入toast样式，否则无样式
import "vant/es/toast/style";
import "@/styles/common.css";
import "@/styles/vant.css";

createApp(App).use(globalExceptionHandle).use(router).use(store).use(directives).mount("#app");
