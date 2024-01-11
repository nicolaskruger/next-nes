import { initNes } from "@/nes/nes";
import { readPpu, writePpu } from "./bus";

describe("ppu bus", () => {
  test.skip("init ppu bus", () => {
    let nes = initNes();

    nes = writePpu(0x0000, 2, nes);

    expect(readPpu(0x0000, nes)).toBe(2);
    expect(readPpu(0x4000, nes)).toBe(2);
    expect(readPpu(0x8000, nes)).toBe(2);
    expect(readPpu(0xc000, nes)).toBe(2);
  });

  test("should throw an exception when cross the board of VRAM", () => {
    let nes = initNes();

    expect(() => {
      readPpu(-1, nes);
    }).toThrow("PPU VRAM out of range");

    expect(() => {
      readPpu(0x10000, nes);
    }).toThrow("PPU VRAM out of range");
  });

  test("should read VRAM correctly", () => {
    let nes = initNes();

    expect(readPpu(0, nes)).toBe(0);
  });
});
