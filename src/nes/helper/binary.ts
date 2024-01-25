export const toBinary8Bits = (value: number): number[] => {
  const strValue = () => (value >>> 0).toString(2);
  const length = () => strValue().length;
  const toArr = (value: string) => value.split("").map((v) => Number(v));
  if (length() > 8) return toArr(strValue().slice(length() - 8));
  if (length() === 8) return toArr(strValue());
  if (length() < 8) return toArr("0".repeat(8 - length()) + strValue());
  return [];
};
