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

    nes = writePpu(0x3f00, 4, nes);

    expect(readPpu(0x3f00, nes)).toBe(4);
    expect(readPpu(0x7f00, nes)).toBe(4);
    expect(readPpu(0xbf00, nes)).toBe(4);
    expect(readPpu(0xff00, nes)).toBe(4);

    expect(readPpu(0x3f20, nes)).toBe(4);
    expect(readPpu(0x7f20, nes)).toBe(4);
    expect(readPpu(0xbf20, nes)).toBe(4);
    expect(readPpu(0xff20, nes)).toBe(4);

    expect(readPpu(0x3f40, nes)).toBe(4);
    expect(readPpu(0x7f40, nes)).toBe(4);
    expect(readPpu(0xbf40, nes)).toBe(4);
    expect(readPpu(0xff40, nes)).toBe(4);

    expect(readPpu(0x3f60, nes)).toBe(4);
    expect(readPpu(0x7f60, nes)).toBe(4);
    expect(readPpu(0xbf60, nes)).toBe(4);
    expect(readPpu(0xff60, nes)).toBe(4);

    expect(readPpu(0x3f80, nes)).toBe(4);
    expect(readPpu(0x7f80, nes)).toBe(4);
    expect(readPpu(0xbf80, nes)).toBe(4);
    expect(readPpu(0xff80, nes)).toBe(4);

    expect(readPpu(0x3fa0, nes)).toBe(4);
    expect(readPpu(0x7fa0, nes)).toBe(4);
    expect(readPpu(0xbfa0, nes)).toBe(4);
    expect(readPpu(0xffa0, nes)).toBe(4);

    expect(readPpu(0x3fc0, nes)).toBe(4);
    expect(readPpu(0x7fc0, nes)).toBe(4);
    expect(readPpu(0xbfc0, nes)).toBe(4);
    expect(readPpu(0xffc0, nes)).toBe(4);
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
});
