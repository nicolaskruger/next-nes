const dexToHex = (value: number, digits: number, prefix: boolean) => {
  const res = (value | 0).toString(16);
  return `${prefix ? "0x" : ""}${"0".repeat(digits - res.length)}${res}`;
};

const dexToHexFourDigitsPrefix = (value: number) => dexToHex(value, 4, true);

const dexToHexTwoDigitsNoPrefix = (value: number) => dexToHex(value, 2, false);

const dexToHexFourDigitsNoPrefix = (value: number) => dexToHex(value, 4, false);

export const dexToHexSixDigitsPrefixHash = (value: number) =>
  "#" + dexToHex(value, 6, false);

const hexToDex = (value: string) => Number(`0x${value}`);

export {
  dexToHex,
  dexToHexFourDigitsPrefix,
  dexToHexTwoDigitsNoPrefix,
  dexToHexFourDigitsNoPrefix,
  hexToDex,
};
