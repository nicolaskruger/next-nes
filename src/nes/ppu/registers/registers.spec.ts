import { readBusNes, writeBusNes } from "@/nes/bus/bus";
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
  isNMIOccur,
  isSprLeftMost8Pix,
  isMoreThan8SpritesOnScanLine,
  shouldIgnoreWritesToVRAM,
  isZeroHitFlag,
  isVBlankOccurring,
  read2003SprAddr,
  write2006AddrVRam,
  getAddrVRam as getPpuAddrVRam,
  getPpuRegisterStatus,
  getAddrVRam,
} from "./registers";
import { readSprRam, writeSprRam } from "../spr-ram/spr-ram";
import { getFirstRead, getVRamAddr, readVRam } from "../vram/vram";

const mutableGet = <T>(nes: Nes, get: (nes: Nes) => [T, Nes]): T => {
  const [data, _nes] = get(nes);
  nes = _nes;
  return data;
};

const testFlag = (
  register: number,
  setValue: number,
  isFlag: (nes: Nes) => [boolean, Nes]
) => {
  const isMutable = (nes: Nes) => mutableGet(nes, isFlag);
  let nes = initNes();
  nes = writeBusNes(register, 0, nes);
  expect(isMutable(nes)).toBe(false);
  nes = writeBusNes(register, setValue, nes);
  expect(isMutable(nes)).toBe(true);
};

const mutateReadSpr = (addr: number, nes: Nes): number => {
  const [data, _nes] = readSprRam(addr, nes);
  nes = _nes;
  return data;
};

describe("PPU registers", () => {
  let nes: Nes;

  beforeEach(() => {
    nes = initNes();
  });
  test("0x2000 bit 0-1 name table", () => {
    const mutableGetNameTable = (nes: Nes) => mutableGet(nes, getNameTable);

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

    nes = writeBusNes(0x2000, 0, nes);

    expect(mutableGetPatternTableSprite(nes)).toBe(0);

    nes = writeBusNes(0x2000, 1 << 3, nes);

    expect(mutableGetPatternTableSprite(nes)).toBe(0x1000);
  });

  test("0x2000 bit 4 pattern table background", () => {
    const mutableGetPatternTableBackground = (nes: Nes) =>
      mutableGet(nes, getPatternTableBackground);

    nes = writeBusNes(0x200, 0, nes);

    expect(mutableGetPatternTableBackground(nes)).toBe(0);

    nes = writeBusNes(0x2000, 1 << 4, nes);

    expect(mutableGetPatternTableBackground(nes)).toBe(0x1000);
  });

  test("0x2000 bit 5", () => {
    const mutableGetSizeOfSprite = (nes: Nes) =>
      mutableGet(nes, getSizeOfSprite);

    nes = writeBusNes(0x2000, 0, nes);

    expect(mutableGetSizeOfSprite(nes)).toBe("8x8");

    nes = writeBusNes(0x2000, 1 << 5, nes);

    expect(mutableGetSizeOfSprite(nes)).toBe("8x16");
  });

  test("0x2000 bit 7", () => {
    testFlag(0x2000, 1 << 7, isNMIOccur);
  });

  test("0x2001 bit 0 color mode", () => {
    const mutateGetColorMode = (nes: Nes) => mutableGet(nes, getColorMode);

    nes = writeBusNes(0x2001, 0, nes);

    expect(mutateGetColorMode(nes)).toBe("color");

    nes = writeBusNes(0x2001, 1, nes);

    expect(mutateGetColorMode(nes)).toBe("mono");
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
    nes = writeBusNes(0x2003, 4, nes);

    expect(read2003SprAddr(nes)[0]).toBe(4);
  });

  test("write spr register", () => {
    nes = writeBusNes(0x2003, 0x0f, nes);
    nes = writeBusNes(0x2004, 0x0e, nes);

    expect(readSprRam(0x0f, nes)[0]).toBe(0x0e);
  });

  test("write register", () => {
    nes = write2006AddrVRam(0x12, nes);

    expect(getPpuRegisterStatus(nes)).toBe("low");

    nes = write2006AddrVRam(0x34, nes);

    expect(getPpuAddrVRam(nes)).toBe(0x1234);
    expect(getPpuRegisterStatus(nes)).toBe("hight");
  });

  test("should write to ppu VRAM", () => {
    nes = writeBusNes(0x2006, 0x12, nes);
    nes = writeBusNes(0x2006, 0x34, nes);
    nes = writeBusNes(0x2000, 1 << 2, nes);
    nes = writeBusNes(0x2007, 0xff, nes);

    expect(getPpuAddrVRam(nes)).toBe(0x1254);
    expect(readVRam(0x1234, nes)[0]).toBe(0xff);
  });

  test("read 2004 spr ram", () => {
    nes = writeBusNes(0x2003, 0x12, nes);
    nes = writeSprRam(0x12, 0x34, nes);

    const [data] = readBusNes(0x2004, nes);

    expect(data).toBe(0x34);
  });

  test("read 2007 vram", () => {
    nes.ppu.vram.bus[0xff].data = 0x12;
    nes = writeBusNes(0x2006, 0x00, nes);
    nes = writeBusNes(0x2006, 0xff, nes);

    expect(getFirstRead(nes)).toBe(true);

    const [data, _nes] = readBusNes(0x2007, nes);

    expect(data).toBe(0x0);
    expect(getVRamAddr(_nes)).toBe(0xff);
    expect(getFirstRead(_nes)).toBe(false);

    const [result, nesResult] = readBusNes(0x2007, _nes);

    expect(result).toBe(0x12);
    expect(getVRamAddr(nesResult)).toBe(0x100);
    expect(getFirstRead(nesResult)).toBe(true);
  });

  test("read 2007 vram", () => {
    nes.ppu.vram.bus[0xff].data = 0x12;
    nes = writeBusNes(0x2006, 0x3f, nes);
    nes = writeBusNes(0x2006, 0x00, nes);
    expect(getAddrVRam(nes)).toBe(0x3f00);
    nes = readBusNes(0x2007, nes)[1];
    expect(getAddrVRam(nes)).toBe(0x3f01);
    nes = readBusNes(0x2007, nes)[1];
    expect(getAddrVRam(nes)).toBe(0x3f02);
  });

  test("write 4014", () => {
    nes = writeBusNes(0x00, 0x0e, nes);
    nes = writeBusNes(0xff, 0x0f, nes);
    nes = writeBusNes(0x4014, 0x00, nes);

    expect(mutateReadSpr(0x00, nes)).toBe(0x0e);
    expect(mutateReadSpr(0xff, nes)).toBe(0x0f);
  });
});
