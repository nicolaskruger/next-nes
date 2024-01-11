import { Nes, initNes } from "@/nes/nes";
import { initPpuBus, readPpu, writePpu } from "./bus";

describe("ppu bus", () => {
  test("init ppu bus", () => {
    let nes = initNes();

    nes = writePpu(0x0000, 2, nes);

    expect(readPpu(0x0000, nes)).toBe(2);
    expect(readPpu(0x4000, nes)).toBe(2);
    expect(readPpu(0x8000, nes)).toBe(2);
    expect(readPpu(0xc000, nes)).toBe(2);
  });
});
