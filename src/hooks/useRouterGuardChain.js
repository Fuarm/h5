import createChain from "@/uitls/createChain";

// 认证权限
const authorizationHandler = () => {
  const whiteList = ["login"];

  function before(to) {
    if (whiteList.indexOf(to.name) > -1) {
      return true;
    }
    return true;
  }

  const after = (to) => {
    return whiteList.indexOf(to.name) === -1;
  };

  return {
    before,
    after
  };
};

export const useRouterGuardChain = () => {
  const { instance: chain } = createChain();

  const _authorizationHandler = authorizationHandler();

  let invoke = null;

  chain.init = function (router) {
    return chain.invoke(() => {
      invoke = (handler, ...args) => handler["init"]?.(router, ...args);
      return true;
    });
  };

  chain.before = function (to, next, router) {
    return chain.invoke(() => {
      invoke = (handler) => handler["before"]?.(to, next, router);
      return true;
    });
  };

  chain.after = function (to, router) {
    return chain.invoke(() => {
      invoke = (handler) => handler["after"]?.(to, router);
      return true;
    });
  };

  chain.authorization = function () {
    return chain.invoke(() => invoke(_authorizationHandler));
  };

  return chain;
};
