import { useToast } from "@/hooks/useToast.js";

const toast = useToast();

export class Exception extends Error {
  constructor(message, name = "Exception", stack = null) {
    super(message); // 继承 Error 的 message 属性
    this.name = name; // 自定义错误类型名称
    this.stack = stack || this.stack;

    Object.setPrototypeOf(this, new.target.prototype); // 解决继承链问题
  }

  static of(message, stack = null, ...args) {
    return new this(message, stack, ...args); // 让子类调用时返回正确的实例
  }

  static asLog(e, ...logs) {
    switch (true) {
      case e instanceof Exception:
        e.log(...logs);
        break;
      case this.prototype instanceof Exception:
        this.log(e, ...logs);
        break;
      case typeof e === "string":
        Exception.log({ message: e }, ...logs);
        break;
      default:
        Exception.log(e, ...logs);
    }
  }

  /** 独立上报 Sentry */
  static captureException() {
    // Sentry.withScope((scope) => {
    //   scope.setExtras({ logs });
    //   Sentry.captureException(e);
    // });
  }

  /** 静态方法调用 */
  static log(e, ...logs) {
    console.error(...logs, e.toString());
    toast.fail(e.message || "系统未知异常");

    // 埋点上传，日志
    Exception.captureException(e, logs);
  }

  /** 实例方法调用 */
  log(...logs) {
    Exception.log(this, ...logs); // 复用静态方法
  }
}

export class RequestException extends Exception {
  constructor(message = "请求异常", stack, name = "RequestException") {
    super(message, name, stack); // 继承 Error 的 message 属性
  }
}

/** 网络异常 */
export class NetworkException extends RequestException {
  constructor(message = "网络异常", stack) {
    super(message, stack, "NetworkException");
  }
}

export class RouterException extends Exception {
  constructor(message = "路由异常", stack) {
    super(message, "RouterException", stack);
  }
}

export class WeChatException extends Exception {
  constructor(message = "微信SDK异常", stack) {
    super(message, "WeChatException", stack);
  }
}

// 全局异常处理
export const globalExceptionHandle = (app) => {
  // vue 异常
  app.config.errorHandler = (error, instance) => {
    Exception.asLog(error, "Vue 异常(%s):", instance?.$options?.name || "匿名组件");
  };

  window.addEventListener("unhandledrejection", (event) => {
    event.preventDefault(); // 阻止控制台输出 Uncaught (in promise)
    Exception.asLog(event.reason, "全局处理 Promise 异常:");
  });

  // 监听全局 JS 运行时错误
  window.onerror = (event, source, lineno, colno, error) => {
    Exception.asLog(error || Exception.of(event), "全局 JS 异常:");
    return true; // 阻止默认错误日志输出
  };
};
