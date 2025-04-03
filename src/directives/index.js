import vDebounce from "./vDebounce.js";

export default (app) => {
  //防抖自定义指令
  app.directive("debounce", vDebounce);
};
