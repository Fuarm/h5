import debounce from "lodash/debounce";

export default {
  mounted(el, binding) {
    const debounceMap = parseBinding(binding.value);
    const eventListeners = getVueEventListeners(el, debounceMap);

    el._debounceHandlers = {};

    for (const event in eventListeners) {
      const originalHandler = eventListeners[event];
      const delay = debounceMap[event] ?? debounceMap["default"];

      if (typeof originalHandler === "function" && delay !== undefined) {
        el._debounceHandlers[event] = debounce(originalHandler, delay);
        el.removeEventListener(event, originalHandler);
        el.addEventListener(event, el._debounceHandlers[event]);
      }
    }
  },

  beforeUnmount(el) {
    if (el._debounceHandlers) {
      for (const event in el._debounceHandlers) {
        el.removeEventListener(event, el._debounceHandlers[event]);
      }
    }
  }
};

/**
 * 解析 v-debounce 绑定的值，返回 { eventName: delay }
 * @param {number | string | Array | Object} value 绑定的值
 * @returns {Record<string, number>}
 */

function parseBinding(value = null) {
  if (typeof value === "number" || value === null) {
    return { default: value ?? 500 }; // 默认防抖 500ms
  }

  if (typeof value === "string") {
    return { [value]: 500 };
  }

  if (Array.isArray(value)) {
    return value.reduce((map, item) => {
      if (typeof item === "string") {
        map[item] = 500;
      } else if (item && typeof item === "object" && item.event) {
        map[item.event] = item.delay ?? 500;
      }
      return map;
    }, {});
  }

  if (typeof value === "object") {
    return Object.entries(value).reduce((map, [key, delay]) => {
      map[key] = typeof delay === "number" ? delay : 500;
      return map;
    }, {});
  }

  return {}; // 无效值返回空对象
}

/**
 * 获取 Vue 绑定的事件，仅返回需要防抖的事件
 * @param {HTMLElement} el
 * @param {Record<string, number>} debounceMap
 * @returns {Record<string, Function>}
 */
function getVueEventListeners(el, debounceMap) {
  const vueEventSymbol = Object.getOwnPropertySymbols(el).find(
    (sym) => sym.toString() === "Symbol(_vei)"
  );
  if (!vueEventSymbol) return {};

  const eventListeners = el[vueEventSymbol] || {};
  const listenersMap = {};

  for (const eventKey in eventListeners) {
    if (Object.prototype.hasOwnProperty.call(eventListeners, eventKey)) {
      const event = eventKey.replace(/^on/, "").toLowerCase(); // onClick -> click

      if (debounceMap[event] !== undefined || debounceMap.default !== undefined) {
        // 仅保留需要防抖的事件
        listenersMap[event] = eventListeners[eventKey];
      }
    }
  }

  return listenersMap;
}
