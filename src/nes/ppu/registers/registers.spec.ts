import { ReadData, readBusNes, writeBusNes } from "@/nes/bus/bus";
import { Nes, initNes } from "@/nes/nes";
import {
  getAmountIncrement,
  getColorMode,
  getNameTable,
  getPatternTableBackground,
  getPatternTableSprite,
  getSizeOfSprite,
  isBgLeftMost8Pix,
  isDisableBg,
  isDisableSpr,
  isMNIOccur,
  isSprLeftMost8Pix,
  isMoreThan8SpritesOnScanLine,
  shouldIgnoreWritesToVRAM,
  isZeroHitFlag,
  isVBlankOccurring,
  readSprAddr,
  write2006AddrVRam,
  getAddrVRam as getPpuAddrVRam,
  getPpuRegisterStatus,
} from "./registers";
import { readSprRam } from "../spr-ram/spr-ram";
import { readVRam } from "../vram/vram";

const testFlag = (
  register: number,
  setValue: number,
  isFlag: (nes: Nes) => boolean
) => {
  let nes = initNes();
  nes = writeBusNes(register, 0, nes);
  expect(isFlag(nes)).toBe(false);
  nes = writeBusNes(register, setValue, nes);
  expect(isFlag(nes)).toBe(true);
};

const mutableGet = (nes: Nes, get: (nes: Nes) => ReadData): number => {
  const [data, _nes] = get(nes);
  nes = _nes;
  return data;
};

describe("PPU registers", () => {
  test("0x2000 bit 0-1 name table", () => {
    const mutableGetNameTable = (nes: Nes) => mutableGet(nes, getNameTable);

    let nes = initNes();

    nes = writeBusNes(0x2000, 0, nes);
    expect(mutableGetNameTable(nes)).toBe(0x2000);

    nes = writeBusNes(0x2000, 1, nes);
    expect(mutableGetNameTable(nes)).toBe(0x2400);

    nes = writeBusNes(0x2000, 2, nes);
    expect(mutableGetNameTable(nes)).toBe(0x2800);

    nes = writeBusNes(0x2000, 3, nes);
    expect(mutableGetNameTable(nes)).toBe(0x2c00);
  });
  test("0x2000 bit 2 amount", () => {
    let nes = initNes();

    const mutableGetAmountIncrement = (nes: Nes) =>
      mutableGet(nes, getAmountIncrement);

    nes = writeBusNes(0x2000, 0, nes);
    expect(mutableGetAmountIncrement(nes)).toBe(1);

    nes = writeBusNes(0x2000, 1 << 2, nes);

    expect(mutableGetAmountIncrement(nes)).toBe(32);
  });

  test("0x2000 bit 3 pattern table sprite", () => {
    const mutableGetPatternTableSprite = (nes: Nes) =>
      mutableGet(nes, getPatternTableSprite);

    let nes = initNes();

    nes = writeBusNes(0x2000, 0, nes);

    expect(mutableGetPatternTableSprite(nes)).toBe(0);

    nes = writeBusNes(0x2000, 1 << 3, nes);

    expect(mutableGetPatternTableSprite(nes)).toBe(0x1000);
  });

  test("0x2000 bit 4 pattern table background", () => {
    let nes = initNes();

    nes = writeBusNes(0x200, 0, nes);

    expect(getPatternTableBackground(nes)).toBe(0);

    nes = writeBusNes(0x2000, 1 << 4, nes);

    expect(getPatternTableBackground(nes)).toBe(0x1000);
  });

  test("0x2000 bit 5", () => {
    let nes = initNes();

    nes = writeBusNes(0x2000, 0, nes);

    expect(getSizeOfSprite(nes)).toBe("8x8");

    nes = writeBusNes(0x2000, 1 << 5, nes);

    expect(getSizeOfSprite(nes)).toBe("8x16");
  });

  test("0x2000 bit 7", () => {
    testFlag(0x2000, 1 << 7, isMNIOccur);
  });

  test("0x2001 bit 0 color mode", () => {
    let nes = initNes();

    nes = writeBusNes(0x2001, 0, nes);

    expect(getColorMode(nes)).toBe("color");

    nes = writeBusNes(0x2001, 1, nes);

    expect(getColorMode(nes)).toBe("mono");
  });

  test("0x2001 bit 1 8bit bg", () => {
    testFlag(0x2001, 1 << 1, isBgLeftMost8Pix);
  });

  test("0x2001 bit 2 8bit spr", () => {
    testFlag(0x2001, 1 << 2, isSprLeftMost8Pix);
  });

  test("0x2001 bit 3 is disable background", () => {
    testFlag(0x2001, 1 << 3, isDisableBg);
  });

  test("0x2001 bit 4 is disable sprite", () => {
    testFlag(0x2001, 1 << 4, isDisableSpr);
  });

  test("0x2002 bit 4 is should ignore write to VRAM", () => {
    testFlag(0x2002, 1 << 4, shouldIgnoreWritesToVRAM);
  });

  test("0x2002 bit 5 more than 8 sprites in the same scan line", () => {
    testFlag(0x2002, 1 << 5, isMoreThan8SpritesOnScanLine);
  });

  test("0x2002 bit 6 zero hit flag", () => {
    testFlag(0x2002, 1 << 6, isZeroHitFlag);
  });

  test("0x2002 bit 7 is vblank accurring", () => {
    testFlag(0x2002, 1 << 7, isVBlankOccurring);
  });

  test("read, spr addr", () => {
    let nes = initNes();

    nes = writeBusNes(0x2003, 4, nes);

    expect(readSprAddr(nes)).toBe(4);
  });

  test("write spr register", () => {
    let nes = initNes();

    nes = writeBusNes(0x2003, 0x0f, nes);
    nes = writeBusNes(0x2004, 0x0e, nes);

    expect(readSprRam(0x0f, nes)).toBe(0x0e);
  });

  test("write register", () => {
    let nes = initNes();

    nes = write2006AddrVRam(0x12, nes);

    expect(getPpuRegisterStatus(nes)).toBe("low");

    nes = write2006AddrVRam(0x34, nes);

    expect(getPpuAddrVRam(nes)).toBe(0x1234);
    expect(getPpuRegisterStatus(nes)).toBe("hight");
  });

  test("should write to ppu VRAM", () => {
    let nes = initNes();

    nes = writeBusNes(0x2006, 0x12, nes);
    nes = writeBusNes(0x2006, 0x34, nes);
    nes = writeBusNes(0x2000, 1 << 2, nes);
    nes = writeBusNes(0x2007, 0xff, nes);

    expect(getPpuAddrVRam(nes)).toBe(0x1254);
    expect(readVRam(0x1234, nes)).toBe(0xff);
  });
});
