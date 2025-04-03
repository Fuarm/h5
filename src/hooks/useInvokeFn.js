import { ref, shallowRef } from "vue";
import { Exception } from "@/utils/exception.js";

export const useInvokeFn = (fn) => {
  const data = shallowRef(null);
  const loading = ref(false);

  const apply = (...args) => {
    loading.value = true;
    try {
      const response = fn(...args);
      if (response instanceof Promise) {
        (async () => (data.value = await response))();
      } else {
        data.value = response;
      }
      return response;
    } catch (error) {
      Exception.asLog(error, "useInvokeFn invoke 异常(%s):", fn.name || "匿名方法");
    } finally {
      loading.value = false;
    }
  };

  return { data, loading, invoke: { apply } };
};
