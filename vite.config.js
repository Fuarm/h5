import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { fileURLToPath } from "url";
import cesium from "vite-plugin-cesium"; // 引入插件
import Components from "unplugin-vue-components/vite";
import { VantResolver } from "unplugin-vue-components/resolvers";
import postcsspxtoviewport8plugin from "postcss-px-to-viewport-8-plugin";
import tailwindcss from "@tailwindcss/vite";
import { viteVConsole } from "vite-plugin-vconsole";

// 获取当前文件目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default ({ mode }) =>
  defineConfig({
    base: "./",
    plugins: [
      vue(),
      cesium(),
      tailwindcss(),
      Components({
        resolvers: [VantResolver()]
      }),
      viteVConsole({
        entry: path.resolve("src/main.js"), // or you can use entry: [path.resolve('src/main.ts')]
        enabled: mode === "uat",
        config: {
          maxLogNumber: 1000,
          theme: "light"
        }
      })
    ],
    resolve: {
      extensions: [".mjs", ".js"], // 默认扩展名，隐藏 .js
      // 配置路径别名
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    },
    css: {
      postcss: {
        plugins: [
          postcsspxtoviewport8plugin({
            unitToConvert: "px",
            viewportWidth: (file) => {
              let num = 375;
              if (file.indexOf("m_") !== -1) {
                num = 375;
              }
              return num;
            },
            unitPrecision: 5, // 单位转换后保留的精度
            propList: ["*"], // 能转化为vw的属性列表
            viewportUnit: "vw", // 希望使用的视口单位
            fontViewportUnit: "vw", // 字体使用的视口单位
            selectorBlackList: [], // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
            minPixelValue: 1, // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
            mediaQuery: true, // 媒体查询里的单位是否需要转换单位
            replace: true, //  是否直接更换属性值，而不添加备用属性
            exclude: [/node_modules\/ant-design-vue/], // 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
            include: [], // 如果设置了include，那将只有匹配到的文件才会被转换
            landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
            landscapeUnit: "vw", // 横屏时使用的单位
            landscapeWidth: 1024 // 横屏时使用的视口宽度
          })
        ]
      }
    }
  });
