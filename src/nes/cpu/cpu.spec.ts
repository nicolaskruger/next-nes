import { toBinary8Bits } from "../helper/binary";
import { initNes } from "../nes";
import { setFlag } from "./cpu";

describe("CPU", () => {
  test("setFlag", () => {
    let nes = initNes();
    nes.cpu.STATUS = 7;
    nes.cpu = setFlag(0, 1, nes);

    expect(7 & ~(1 << 1)).toBe(5);

    expect(nes.cpu.STATUS).toBe(5);
  });
});
