import { showToast, showLoadingToast, showSuccessToast, showFailToast } from "vant";

let toast = null;

export const useToast = () => {
  const info = (message) => {
    toast = null;
    showToast({
      forbidClick: false,
      message
    });
  };

  const loading = (message = "加载中...") => {
    toast = showLoadingToast({
      duration: 0,
      forbidClick: true,
      message,
      loadingType: "spinner"
    });
  };

  const success = (message = "成功") => {
    toast = null;
    showSuccessToast({
      forbidClick: true,
      message
    });
  };

  const fail = (message = "失败") => {
    toast = null;
    showFailToast({
      forbidClick: true,
      message
    });
  };

  const clear = () => {
    toast?.close();
    toast = null;
  };

  const setMessage = (message) => {
    if (toast) {
      toast.message = message;
    }
  };

  return {
    info,
    clear,
    setMessage,
    loading,
    success,
    fail
  };
};
