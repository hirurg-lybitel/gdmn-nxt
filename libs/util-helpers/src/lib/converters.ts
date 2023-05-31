export function bin2String(binArray: (string | number)[]) {
  const array = binArray.map(b => +b);
  let result = '';
  for (let i = 0; i < array.length; i++) {
    result += String.fromCharCode(array[i]);
  }
  return result;
};


export function string2Bin(charArray = '') {
  const charCodeArr = [];

  for (let i = 0; i < charArray.length; i++) {
    const code = charArray.charCodeAt(i);
    charCodeArr.push(code);
  };

  return charCodeArr;
};
