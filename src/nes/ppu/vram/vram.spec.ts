import { Nes, initNes } from "@/nes/nes";
import { readVRam, writeVRam } from "./vram";

const readVRamMutate = (addr: number, nes: Nes): number => {
  const [_data, _nes] = readVRam(addr, nes);
  nes = _nes;
  return _data;
};

describe("ppu bus", () => {
  test("init ppu bus", () => {
    let nes = initNes();

    nes = writeVRam(0x0000, 2, nes);

    expect(readVRamMutate(0x0000, nes)).toBe(2);
    expect(readVRamMutate(0x4000, nes)).toBe(2);
    expect(readVRamMutate(0x8000, nes)).toBe(2);
    expect(readVRamMutate(0xc000, nes)).toBe(2);

    nes = writeVRam(0x2000, 3, nes);

    expect(readVRamMutate(0x2000, nes)).toBe(3);
    expect(readVRamMutate(0x6000, nes)).toBe(3);
    expect(readVRamMutate(0xa000, nes)).toBe(3);
    expect(readVRamMutate(0xe000, nes)).toBe(3);
    expect(readVRamMutate(0x3000, nes)).toBe(3);
    expect(readVRamMutate(0x7000, nes)).toBe(3);
    expect(readVRamMutate(0xb000, nes)).toBe(3);
    expect(readVRamMutate(0xf000, nes)).toBe(3);

    nes = writeVRam(0x3f00, 4, nes);

    expect(readVRamMutate(0x3f00, nes)).toBe(4);
    expect(readVRamMutate(0x7f00, nes)).toBe(4);
    expect(readVRamMutate(0xbf00, nes)).toBe(4);
    expect(readVRamMutate(0xff00, nes)).toBe(4);

    expect(readVRamMutate(0x3f20, nes)).toBe(4);
    expect(readVRamMutate(0x7f20, nes)).toBe(4);
    expect(readVRamMutate(0xbf20, nes)).toBe(4);
    expect(readVRamMutate(0xff20, nes)).toBe(4);

    expect(readVRamMutate(0x3f40, nes)).toBe(4);
    expect(readVRamMutate(0x7f40, nes)).toBe(4);
    expect(readVRamMutate(0xbf40, nes)).toBe(4);
    expect(readVRamMutate(0xff40, nes)).toBe(4);

    expect(readVRamMutate(0x3f60, nes)).toBe(4);
    expect(readVRamMutate(0x7f60, nes)).toBe(4);
    expect(readVRamMutate(0xbf60, nes)).toBe(4);
    expect(readVRamMutate(0xff60, nes)).toBe(4);

    expect(readVRamMutate(0x3f80, nes)).toBe(4);
    expect(readVRamMutate(0x7f80, nes)).toBe(4);
    expect(readVRamMutate(0xbf80, nes)).toBe(4);
    expect(readVRamMutate(0xff80, nes)).toBe(4);

    expect(readVRamMutate(0x3fa0, nes)).toBe(4);
    expect(readVRamMutate(0x7fa0, nes)).toBe(4);
    expect(readVRamMutate(0xbfa0, nes)).toBe(4);
    expect(readVRamMutate(0xffa0, nes)).toBe(4);

    expect(readVRamMutate(0x3fc0, nes)).toBe(4);
    expect(readVRamMutate(0x7fc0, nes)).toBe(4);
    expect(readVRamMutate(0xbfc0, nes)).toBe(4);
    expect(readVRamMutate(0xffc0, nes)).toBe(4);
  });

  test("should throw an exception when cross the board of VRAM when reading", () => {
    let nes = initNes();

    expect(() => {
      readVRam(-1, nes);
    }).toThrow("PPU VRAM out of range");

    expect(() => {
      readVRam(0x10000, nes);
    }).toThrow("PPU VRAM out of range");
  });

  test("should read VRAM correctly", () => {
    let nes = initNes();

    expect(readVRam(0, nes)[0]).toBe(0);
  });

  test("should throw an exception when cross the board of VRAM when writing", () => {
    let nes = initNes();

    expect(() => {
      writeVRam(-1, 1, nes);
    }).toThrow("PPU VRAM out of range");

    expect(() => {
      writeVRam(0x10000, 1, nes);
    }).toThrow("PPU VRAM out of range");
  });

  test("should write VRAM correctly", () => {
    let nes = initNes();

    nes = writeVRam(0, 1, nes);

    expect(readVRam(0, nes)[0]).toBe(1);
  });
});
