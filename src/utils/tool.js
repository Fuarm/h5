export const format = {
  toAmount: (val = "", precision = 4) => {
    const valStr = val.toString().replace(/[^0-9.]|^[.]/g, "");
    if (valStr === "") {
      return (0).toFixed(precision);
    }

    let [integerPart, decimalPart = ""] = valStr.split(".");

    integerPart = Number(integerPart)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    decimalPart = decimalPart.slice(0, precision).padEnd(precision, "0");

    return precision === 0 ? integerPart : `${integerPart}.${decimalPart}`;
  },
  toNumber: (val = "") => {
    const valStr = val.toString().replace(/[^0-9.]|^[.]/g, "");
    if (valStr === "") {
      return 0;
    }

    return Number(valStr);
  },
  toString: (val = "") => {
    return val.toString().trim() === "" ? "--" : val.toString();
  }
};

export const convert = {
  pxToRem: (val, root = 16) => {
    return `${format.toNumber(val) / root}rem`;
  }
};
