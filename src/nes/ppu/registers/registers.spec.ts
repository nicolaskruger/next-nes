import { writeBusNes } from "@/nes/bus/bus";
import { initNes } from "@/nes/nes";
import {
  getAmountIncrement,
  getColorMode,
  getNameTable,
  getPatterTableBackground,
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
} from "./registers";

describe("PPU registers", () => {
  test("0x2000 bit 0-1 name table", () => {
    let nes = initNes();

    nes = writeBusNes(0x2000, 0, nes);
    expect(getNameTable(nes)).toBe(0x2000);

    nes = writeBusNes(0x2000, 1, nes);
    expect(getNameTable(nes)).toBe(0x2400);

    nes = writeBusNes(0x2000, 2, nes);
    expect(getNameTable(nes)).toBe(0x2800);

    nes = writeBusNes(0x2000, 3, nes);
    expect(getNameTable(nes)).toBe(0x2c00);
  });
  test("0x2000 bit 2 amount", () => {
    let nes = initNes();

    nes = writeBusNes(0x2000, 0, nes);
    expect(getAmountIncrement(nes)).toBe(1);

    nes = writeBusNes(0x2000, 1 << 2, nes);

    expect(getAmountIncrement(nes)).toBe(32);
  });

  test("0x2000 bit 3 pattern table sprite", () => {
    let nes = initNes();

    nes = writeBusNes(0x2000, 0, nes);

    expect(getPatternTableSprite(nes)).toBe(0);

    nes = writeBusNes(0x2000, 1 << 3, nes);

    expect(getPatternTableSprite(nes)).toBe(0x1000);
  });

  test("0x2000 bit 4 pattern table background", () => {
    let nes = initNes();

    nes = writeBusNes(0x200, 0, nes);

    expect(getPatterTableBackground(nes)).toBe(0);

    nes = writeBusNes(0x2000, 1 << 4, nes);

    expect(getPatterTableBackground(nes)).toBe(0x1000);
  });

  test("0x2000 bit 5", () => {
    let nes = initNes();

    nes = writeBusNes(0x2000, 0, nes);

    expect(getSizeOfSprite(nes)).toBe("8x8");

    nes = writeBusNes(0x2000, 1 << 5, nes);

    expect(getSizeOfSprite(nes)).toBe("8x16");
  });

  test("0x2000 bit 7", () => {
    let nes = initNes();

    nes = writeBusNes(0x2000, 0, nes);

    expect(isMNIOccur(nes)).toBe(false);

    nes = writeBusNes(0x2000, 1 << 7, nes);

    expect(isMNIOccur(nes)).toBe(true);
  });

  test("0x2001 bit 0 color mode", () => {
    let nes = initNes();

    nes = writeBusNes(0x2001, 0, nes);

    expect(getColorMode(nes)).toBe("color");

    nes = writeBusNes(0x2001, 1, nes);

    expect(getColorMode(nes)).toBe("mono");
  });

  test("0x2001 bit 1 8bit bg", () => {
    let nes = initNes();

    nes = writeBusNes(0x2001, 0, nes);

    expect(isBgLeftMost8Pix(nes)).toBe(false);

    nes = writeBusNes(0x2001, 1 << 1, nes);

    expect(isBgLeftMost8Pix(nes)).toBe(true);
  });

  test("0x2001 bit 2 8bit spr", () => {
    let nes = initNes();

    nes = writeBusNes(0x2001, 0, nes);

    expect(isSprLeftMost8Pix(nes)).toBe(false);

    nes = writeBusNes(0x2001, 1 << 2, nes);

    expect(isSprLeftMost8Pix(nes)).toBe(true);
  });

  test("0x2001 bit 3 is disable background", () => {
    let nes = initNes();

    nes = writeBusNes(0x2001, 0, nes);

    expect(isDisableBg(nes)).toBe(false);

    nes = writeBusNes(0x2001, 1 << 3, nes);

    expect(isDisableBg(nes)).toBe(true);
  });

  test("0x2001 bit 4 is disable sprite", () => {
    let nes = initNes();

    nes = writeBusNes(0x2001, 0, nes);

    expect(isDisableSpr(nes)).toBe(false);

    nes = writeBusNes(0x2001, 1 << 4, nes);

    expect(isDisableSpr(nes)).toBe(true);
  });

  test("0x2002 bit 4 is should ignore write to VRAM", () => {
    let nes = initNes();

    nes = writeBusNes(0x2002, 0, nes);

    expect(shouldIgnoreWritesToVRAM(nes)).toBe(false);

    nes = writeBusNes(0x2002, 1 << 4, nes);

    expect(shouldIgnoreWritesToVRAM(nes)).toBe(true);
  });

  test("0x2002 bit 5 more than 8 sprites in the same scan line", () => {
    let nes = initNes();

    nes = writeBusNes(0x2002, 0, nes);

    expect(isMoreThan8SpritesOnScanLine(nes)).toBe(false);

    nes = writeBusNes(0x2002, 1 << 5, nes);

    expect(isMoreThan8SpritesOnScanLine(nes)).toBe(true);
  });

  test("0x2002 bit 6 zero hit flag", () => {
    let nes = initNes();

    nes = writeBusNes(0x2002, 0, nes);

    expect(isZeroHitFlag(nes)).toBe(false);

    nes = writeBusNes(0x2002, 1 << 6, nes);

    expect(isZeroHitFlag(nes)).toBe(true);
  });
});
