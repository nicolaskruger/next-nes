export const setBit = (
  value: number,
  bit: number,
  position: number
): number => {
  if (bit === 1) return value | (bit << position);
  return value & ~(1 << position);
};
