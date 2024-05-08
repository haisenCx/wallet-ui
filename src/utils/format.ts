export function formatAddress(address: string) {
  return address.slice(0, 4) + "..." + address.slice(-4);
}
export const formatValue = (s: string): string => {
  const num = Number(s);
  // 如果是整数，就直接返回
  if (num % 1 === 0) {
    return num.toString();
  }
  return Number(s).toFixed(4);
  if (s.length > 7) {
    return s.slice(0, 7);
  }
  return s;
};

export const formatValue2 = (s: string|number): string => {
  return Number(s).toFixed(2);
};

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  // 使用Intl.DateTimeFormat进行格式化，指定时区和格式选项
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC', // 这里设置为UTC，具体时区根据需要调整
    month: 'short', // "Jan", "Feb", "Mar", ...
    day: '2-digit', // "01", "02", ...
    year: 'numeric', // "2024"
    hour: '2-digit', // "14", "15", ...
    minute: '2-digit', // "23", "24", ...
    hour12: false // 使用24小时制
  });
  return formatter.format(date);
}

/**
 * formatAndShortenNumber 函数
 * @param num 输入的数字，可以是字符串或数字类型
 * @returns 格式化后的数字字符串
 * 
 * 这个函数的主要目的是将数字截短方便展示。
 * 如果数字大于或等于10000，它会被除以1000并添加后缀"k"。
 * 如果数字小于1，它会检查第一个非零数字出现的位置，
 * 如果零数位大于等于4，它会返回形如'0.0{4}2'的字符串，
 * 否则，它会保留足够的小数位以确保总长度为5（不包括小数点）。
 * 对于其他情况，它会根据整数部分的长度来确定小数位数，以确保总长度为5（不包括小数点）。
 */
export function formatToShortenNumber(num: string | number) {
  const digit = 5;

  console.log(Number(num), num)
  if (typeof num == "string") num = Number(num)

  let formattedNum = num.toString(), affix = "";

  if (num >= 10000) {
    num = (num / 1000);
    affix = "k"
  }

  const str = num.toString().replace(".", "");
  if (str.length > digit) {
    if (num < 1) {
      const match = str.match(/^(0*)([1-9])/) || []
      if (match && match[1].length > digit) {
        formattedNum = `0.0{${match[1].length - 1}}${match[2]}`;
      } else {
        formattedNum = '0.' + str.slice(1, digit);
      }
    } else {

      formattedNum = num.toString().slice(0, digit + 1)
    }
  }

  return formattedNum + affix;
}
