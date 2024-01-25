import { toBinary8Bits } from "./binary";

describe("binary", () => {
  test("should convert when have 8 bits", () => {
    const _8bitNumber = (1 << 7) | 1;

    expect(toBinary8Bits(_8bitNumber)).toStrictEqual([1, 0, 0, 0, 0, 0, 0, 1]);
  });

  test("should convert when have more them 8 bits", () => {
    const _8bitNumber = (1 << 9) | (1 << 7) | 1;

    expect(toBinary8Bits(_8bitNumber)).toStrictEqual([1, 0, 0, 0, 0, 0, 0, 1]);
  });

  test("should convert when have less them 8 bits", () => {
    const _8bitNumber = (1 << 6) | 1;

    expect(toBinary8Bits(_8bitNumber)).toStrictEqual([0, 1, 0, 0, 0, 0, 0, 1]);
  });
});
