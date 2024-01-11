import { initNes } from "@/nes/nes";
import { readPpu, writePpu } from "./bus";

describe("ppu bus", () => {
  test("init ppu bus", () => {
    let nes = initNes();

    nes = writePpu(0x0000, 2, nes);

    expect(readPpu(0x0000, nes)).toBe(2);
    expect(readPpu(0x4000, nes)).toBe(2);
    expect(readPpu(0x8000, nes)).toBe(2);
    expect(readPpu(0xc000, nes)).toBe(2);

    nes = writePpu(0x2000, 3, nes);

    expect(readPpu(0x2000, nes)).toBe(3);
    expect(readPpu(0x6000, nes)).toBe(3);
    expect(readPpu(0xa000, nes)).toBe(3);
    expect(readPpu(0xe000, nes)).toBe(3);
    expect(readPpu(0x3000, nes)).toBe(3);
    expect(readPpu(0x7000, nes)).toBe(3);
    expect(readPpu(0xb000, nes)).toBe(3);
    expect(readPpu(0xf000, nes)).toBe(3);
  });

  test("should throw an exception when cross the board of VRAM when reading", () => {
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

  test("should throw an exception when cross the board of VRAM when writing", () => {
    let nes = initNes();

    expect(() => {
      writePpu(-1, 1, nes);
    }).toThrow("PPU VRAM out of range");

    expect(() => {
      writePpu(0x10000, 1, nes);
    }).toThrow("PPU VRAM out of range");
  });

  test("should write VRAM correctly", () => {
    let nes = initNes();

    nes = writePpu(0, 1, nes);

    expect(readPpu(0, nes)).toBe(1);
  });

  test("hex calc", () => {
    const result = 0x3f20 - 0x3f00;

    expect(result).toBe(0);
  });
});
