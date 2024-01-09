import { dexToHex } from "./converter";

describe("convert", () => {
  test("convert dex to hex for digits", () => {
    expect(dexToHex(1, 4, true)).toBe("0x0001");
  });
});
