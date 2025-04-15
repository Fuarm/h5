export const format = {
  toAmount: (val, precision = 4) => {
    return format.toCleanNumberString(val)
      .replace(/^(\d+)(?=\.)?/, match => match.replace(/\B(?=(\d{3})+(?!\d))/g, ",")) // 添加千位分隔符
      .replace(/(\.\d*)/, match => match.slice(0, precision ? precision + 1 : 0).padEnd(precision + 1, "0"));  // 小数部分限制精度
  },
  // 实时输入格式化金额
  toAmountByInput: (val, precision = 4) => {
    return format.toCleanNumberString(val)
      .replace(/^(\d+)(?=\.)?/, match => match.replace(/\B(?=(\d{3})+(?!\d))/g, ",")) // 添加千位分隔符
      .replace(/(\.\d*)/, match => match.slice(0, precision ? precision + 1 : 0));  // 小数部分限制精度
  },
  toNumber: (val) => {
    const valStr = format.toCleanNumberString(val);
    return Number(valStr);
  },
  toCleanNumberString: (val) => {
    return (val ?? "")
      .toString()
      .replace(/^[^0-9]*/, "")           // 去除开头的非法字符，直到第一个数字
      .replace(/[^0-9.]/g, "")           // 去除所有非法字符（非数字和非小数点）
      .replace(/./g, (match, i, target) => i === target.indexOf(".") || match !== "." ? match : '') // 只保留第一个小数点，去除其他小数点
      .replace(/^0+(\d)/, "$1") // 去除前导0（保留一个数字，如001 → 1）
      .replace(/^0+$/, "0"); // 特殊处理全是0的情况，如000000 → 0
  },
  toString: (val) => {
    return (val ?? "").toString().trim() === "" ? "--" : val.toString();
  }
};

export const convert = {
  pxToRem: (val, root = 16) => {
    return `${format.toNumber(val) / root}rem`;
  },
  pxToFitPx: (val) => {
    return (
      parseFloat(getComputedStyle(document.documentElement).fontSize) *
      parseFloat(convert.pxToRem(val))
    );
  }
};
