import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { fileURLToPath } from "url";
import cesium from "vite-plugin-cesium"; // 引入插件

// 获取当前文件目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: "./",
  plugins: [vue(), cesium()],
  resolve: {
    extensions: [".mjs", ".js"], // 默认扩展名，隐藏 .js
    // 配置路径别名
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
