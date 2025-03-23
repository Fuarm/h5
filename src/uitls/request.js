import axios from "axios";
import { NetworkException, RequestException } from "@/uitls/exception.js";
import { useInvokeFn } from "@/hooks/useInvokeFn.js";
import { useUserStore } from "@/store/useUserStore.js";

const errorEnum = {
  ERR_NETWORK: "网络异常，请检查您的网络连接是否正常!"
};

const { invoke } = useInvokeFn(useUserStore);

// 错误处理
const errorHandler = (error) => {
  const message = errorEnum[error.code] || error.message || "系统服务异常";
  let exception = RequestException;

  switch (error.code) {
    case 401:
      invoke.apply()?.logout();
      break;
    case "ERR_NETWORK":
      exception = NetworkException;
      break;
  }

  exception.log({ ...error.stack, message }, "%s：%s", exception.name, message);
  throw exception.of(message);
};

// 响应拦截错误处理
const responseErrorHandler = async (error) => {
  const config = error.config;
  const rejectError = {
    code: error.status || error.code,
    stack: error,
    message: error.message
  };
  // 如果 `retry` 选项不存在或次数用尽，直接返回错误
  if (!config || !config.retry) errorHandler(rejectError);

  config.__retryCount = config.__retryCount || 0; // 记录当前重试次数

  // 判断是否超过最大重试次数
  if (config.__retryCount >= config.retry) {
    errorHandler(rejectError);
  }

  // 记录重试次数 +1
  config.__retryCount += 1;

  // 等待一段时间再重试
  await new Promise((resolve) => setTimeout(resolve, config.retryDelay));

  // 重新发送请求
  return instance(config);
};

// 请求拦截处理
const requestHandler = (config) => {
  // 设置默认重试次数
  config.retry = config.retry || 1;
  config.retryDelay = config.retryDelay || 500; // 每次重试间隔 1s
  // 处理前缀
  if (config.prefix) {
    config.baseURL = `${config.baseURL}/${config.prefix}`;
  }
  // 获取本地的 token
  const token = sessionStorage.getItem("token");
  if (token) {
    // 将 token 添加到请求报文头中
    config.headers.token = token;
  }
  return config;
};

// 响应拦截处理
const responseHandler = (response) => {
  // blob 处理
  if (response.config.responseType === "blob") {
    return response.data;
  }
  // 携带token，将token存储到本地
  if (response.headers.token) {
    sessionStorage.setItem("token", response.headers.token);
  }
  // 普通请求处理
  const { code, data } = response.data;
  // 转义 code，对接第三方系统 code编码不一致
  let transcoding = {
    0: 200,
    1: 203,
    3: 401
  };
  return (transcoding[code] || code) === 200
    ? data
    : errorHandler({ ...response.data, stack: response });
};

// 创建 axios 实例
const instance = axios.create({
  // API 请求的默认前缀
  baseURL: "/api",
  timeout: 6000 // 请求超时时间
});

// 请求拦截器
instance.interceptors.request.use((config) => {
  return requestHandler(config);
});

// 响应拦截器
instance.interceptors.response.use((response) => {
  return responseHandler(response);
}, responseErrorHandler);

export default instance;
