import { Nes, initNes } from "@/nes/nes";
import {
  getTile,
  horizontalMirror,
  readVRam,
  verticalMirror,
  writeVRam,
} from "./vram";
import { parse } from "path";

const readVRamMutate = (addr: number, nes: Nes): number => {
  const [_data, _nes] = readVRam(addr, nes);
  nes = _nes;
  return _data;
};

describe("ppu bus", () => {
  let nes: Nes;

  beforeEach(() => {
    nes = initNes();
  });

  test("init ppu bus", () => {
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
    expect(readVRamMutate(0x3f04, nes)).toBe(4);
    expect(readVRamMutate(0x3f08, nes)).toBe(4);
    expect(readVRamMutate(0x3f0c, nes)).toBe(4);
    expect(readVRamMutate(0x3f10, nes)).toBe(4);
    expect(readVRamMutate(0x3f14, nes)).toBe(4);
    expect(readVRamMutate(0x3f18, nes)).toBe(4);
    expect(readVRamMutate(0x3f1c, nes)).toBe(4);
    expect(readVRamMutate(0x7f00, nes)).toBe(4);
    expect(readVRamMutate(0x7f00, nes)).toBe(4);
    expect(readVRamMutate(0x7f04, nes)).toBe(4);
    expect(readVRamMutate(0x7f08, nes)).toBe(4);
    expect(readVRamMutate(0x7f0c, nes)).toBe(4);
    expect(readVRamMutate(0x7f10, nes)).toBe(4);
    expect(readVRamMutate(0x7f14, nes)).toBe(4);
    expect(readVRamMutate(0x7f18, nes)).toBe(4);
    expect(readVRamMutate(0x7f1c, nes)).toBe(4);
    expect(readVRamMutate(0xbf00, nes)).toBe(4);
    expect(readVRamMutate(0xbf00, nes)).toBe(4);
    expect(readVRamMutate(0xbf04, nes)).toBe(4);
    expect(readVRamMutate(0xbf08, nes)).toBe(4);
    expect(readVRamMutate(0xbf0c, nes)).toBe(4);
    expect(readVRamMutate(0xbf10, nes)).toBe(4);
    expect(readVRamMutate(0xbf14, nes)).toBe(4);
    expect(readVRamMutate(0xbf18, nes)).toBe(4);
    expect(readVRamMutate(0xbf1c, nes)).toBe(4);
    expect(readVRamMutate(0xff00, nes)).toBe(4);
    expect(readVRamMutate(0xff00, nes)).toBe(4);
    expect(readVRamMutate(0xff04, nes)).toBe(4);
    expect(readVRamMutate(0xff08, nes)).toBe(4);
    expect(readVRamMutate(0xff0c, nes)).toBe(4);
    expect(readVRamMutate(0xff10, nes)).toBe(4);
    expect(readVRamMutate(0xff14, nes)).toBe(4);
    expect(readVRamMutate(0xff18, nes)).toBe(4);
    expect(readVRamMutate(0xff1c, nes)).toBe(4);

    expect(readVRamMutate(0x3f20, nes)).toBe(4);
    expect(readVRamMutate(0x3f20, nes)).toBe(4);
    expect(readVRamMutate(0x3f24, nes)).toBe(4);
    expect(readVRamMutate(0x3f28, nes)).toBe(4);
    expect(readVRamMutate(0x3f2c, nes)).toBe(4);
    expect(readVRamMutate(0x3f30, nes)).toBe(4);
    expect(readVRamMutate(0x3f34, nes)).toBe(4);
    expect(readVRamMutate(0x3f38, nes)).toBe(4);
    expect(readVRamMutate(0x3f3c, nes)).toBe(4);
    expect(readVRamMutate(0x7f20, nes)).toBe(4);
    expect(readVRamMutate(0x7f24, nes)).toBe(4);
    expect(readVRamMutate(0x7f28, nes)).toBe(4);
    expect(readVRamMutate(0x7f2c, nes)).toBe(4);
    expect(readVRamMutate(0x7f30, nes)).toBe(4);
    expect(readVRamMutate(0x7f34, nes)).toBe(4);
    expect(readVRamMutate(0x7f38, nes)).toBe(4);
    expect(readVRamMutate(0x7f3c, nes)).toBe(4);

    expect(readVRamMutate(0xbf20, nes)).toBe(4);
    expect(readVRamMutate(0xbf24, nes)).toBe(4);
    expect(readVRamMutate(0xbf28, nes)).toBe(4);
    expect(readVRamMutate(0xbf2c, nes)).toBe(4);
    expect(readVRamMutate(0xbf30, nes)).toBe(4);
    expect(readVRamMutate(0xbf34, nes)).toBe(4);
    expect(readVRamMutate(0xbf38, nes)).toBe(4);
    expect(readVRamMutate(0xbf3c, nes)).toBe(4);

    expect(readVRamMutate(0xff20, nes)).toBe(4);
    expect(readVRamMutate(0xff24, nes)).toBe(4);
    expect(readVRamMutate(0xff28, nes)).toBe(4);
    expect(readVRamMutate(0xff2c, nes)).toBe(4);
    expect(readVRamMutate(0xff30, nes)).toBe(4);
    expect(readVRamMutate(0xff34, nes)).toBe(4);
    expect(readVRamMutate(0xff38, nes)).toBe(4);
    expect(readVRamMutate(0xff3c, nes)).toBe(4);

    expect(readVRamMutate(0x3f40, nes)).toBe(4);
    expect(readVRamMutate(0x3f44, nes)).toBe(4);
    expect(readVRamMutate(0x3f48, nes)).toBe(4);
    expect(readVRamMutate(0x3f4c, nes)).toBe(4);
    expect(readVRamMutate(0x3f50, nes)).toBe(4);
    expect(readVRamMutate(0x3f54, nes)).toBe(4);
    expect(readVRamMutate(0x3f58, nes)).toBe(4);
    expect(readVRamMutate(0x3f5c, nes)).toBe(4);

    expect(readVRamMutate(0x7f40, nes)).toBe(4);
    expect(readVRamMutate(0x7f44, nes)).toBe(4);
    expect(readVRamMutate(0x7f48, nes)).toBe(4);
    expect(readVRamMutate(0x7f4c, nes)).toBe(4);
    expect(readVRamMutate(0x7f50, nes)).toBe(4);
    expect(readVRamMutate(0x7f54, nes)).toBe(4);
    expect(readVRamMutate(0x7f58, nes)).toBe(4);
    expect(readVRamMutate(0x7f5c, nes)).toBe(4);

    expect(readVRamMutate(0xbf40, nes)).toBe(4);
    expect(readVRamMutate(0xbf44, nes)).toBe(4);
    expect(readVRamMutate(0xbf48, nes)).toBe(4);
    expect(readVRamMutate(0xbf4c, nes)).toBe(4);
    expect(readVRamMutate(0xbf50, nes)).toBe(4);
    expect(readVRamMutate(0xbf54, nes)).toBe(4);
    expect(readVRamMutate(0xbf58, nes)).toBe(4);
    expect(readVRamMutate(0xbf5c, nes)).toBe(4);

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
    expect(() => {
      readVRam(-1, nes);
    }).toThrow("PPU VRAM out of range");

    expect(() => {
      readVRam(0x10000, nes);
    }).toThrow("PPU VRAM out of range");
  });

  test("should read VRAM correctly", () => {
    expect(readVRam(0, nes)[0]).toBe(0);
  });

  test("should throw an exception when cross the board of VRAM when writing", () => {
    expect(() => {
      writeVRam(-1, 1, nes);
    }).toThrow("PPU VRAM out of range");

    expect(() => {
      writeVRam(0x10000, 1, nes);
    }).toThrow("PPU VRAM out of range");
  });

  test("should write VRAM correctly", () => {
    nes = writeVRam(0, 1, nes);

    expect(readVRam(0, nes)[0]).toBe(1);
  });

  const binaryToInt = (binary: string) => parseInt(binary, 2);

  const writeVRamBinary = (addr: number, binary: string, nes: Nes) =>
    writeVRam(addr, binaryToInt(binary), nes);

  test("get pattern table", () => {
    nes = writeVRamBinary(0x0000, "00000000", nes);
    nes = writeVRamBinary(0x0001, "00000000", nes);
    nes = writeVRamBinary(0x0002, "00000000", nes);
    nes = writeVRamBinary(0x0003, "00000000", nes);
    nes = writeVRamBinary(0x0004, "00000000", nes);
    nes = writeVRamBinary(0x0005, "00000000", nes);
    nes = writeVRamBinary(0x0006, "01111110", nes);
    nes = writeVRamBinary(0x0007, "00111100", nes);

    nes = writeVRamBinary(0x0008, "00111100", nes);
    nes = writeVRamBinary(0x0009, "01111110", nes);
    nes = writeVRamBinary(0x000a, "01111110", nes);
    nes = writeVRamBinary(0x000b, "11111111", nes);
    nes = writeVRamBinary(0x000c, "11111111", nes);
    nes = writeVRamBinary(0x000d, "11111111", nes);
    nes = writeVRamBinary(0x000e, "01000010", nes);
    nes = writeVRamBinary(0x000f, "00000000", nes);

    expect(getTile(0, nes)[0]).toStrictEqual([
      [0, 0, 2, 2, 2, 2, 0, 0],
      [0, 2, 2, 2, 2, 2, 2, 0],
      [0, 2, 2, 2, 2, 2, 2, 0],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [0, 3, 1, 1, 1, 1, 3, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ]);
  });

  test("horizontal mirror", () => {
    nes = horizontalMirror(nes);

    nes = writeVRam(0x2000, 1, nes);
    nes = writeVRam(0x2800, 2, nes);

    const reg2000 = readVRamMutate(0x2000, nes);

    expect(reg2000).toBe(1);

    const reg2400 = readVRamMutate(0x2400, nes);

    expect(reg2400).toBe(1);

    const reg2800 = readVRamMutate(0x2800, nes);

    expect(reg2800).toBe(2);

    const reg2c00 = readVRamMutate(0x2c00, nes);

    expect(reg2c00).toBe(2);
  });

  test("vertical mirror", () => {
    nes = verticalMirror(nes);

    nes = writeVRam(0x2000, 1, nes);
    nes = writeVRam(0x2400, 2, nes);

    const reg2000 = readVRamMutate(0x2000, nes);

    expect(reg2000).toBe(1);

    const reg2400 = readVRamMutate(0x2400, nes);

    expect(reg2400).toBe(2);

    const reg2800 = readVRamMutate(0x2800, nes);

    expect(reg2800).toBe(1);

    const reg2c00 = readVRamMutate(0x2c00, nes);

    expect(reg2c00).toBe(2);
  });
});
