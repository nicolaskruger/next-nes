import { readBusNes, writeBusNes } from "@/nes/bus/bus";
import { Nes, nesBuilder } from "@/nes/nes";
import { writeSprRam } from "../spr-ram/spr-ram";
import { Dictionary } from "@/nes/helper/dictionary";
import { PpuStatusRegister } from "../ppu";

export const getNameTable = (nes: Nes): number => {
  const data = readBusNes(0x2000, nes) & (1 | (1 << 1));
  return [0x2000, 0x2400, 0x2800, 0x2c00][data];
};

export const getAmountIncrement = (nes: Nes): number => {
  const data = (readBusNes(0x2000, nes) >> 2) & 1;

  return [1, 32][data];
};

export const getPatternTableSprite = (nes: Nes): number => {
  const data = (readBusNes(0x2000, nes) >> 3) & 1;
  return [0x0000, 0x1000][data];
};

export const getPatterTableBackground = (nes: Nes): number => {
  const data = (readBusNes(0x2000, nes) >> 4) & 1;
  return [0x0000, 0x1000][data];
};

type SizeOfSprite = "8x8" | "8x16";

export const getSizeOfSprite = (nes: Nes): SizeOfSprite => {
  const data = (readBusNes(0x2000, nes) >> 5) & 1;
  const ret: SizeOfSprite[] = ["8x8", "8x16"];
  return ret[data];
};

export const isMNIOccur = (nes: Nes): boolean =>
  !!((readBusNes(0x2000, nes) >> 7) & 1);

type ColorMode = "mono" | "color";

export const getColorMode = (nes: Nes): ColorMode => {
  const data = readBusNes(0x2001, nes) & 1;
  const ret: ColorMode[] = ["color", "mono"];
  return ret[data];
};

export const isBgLeftMost8Pix = (nes: Nes): boolean => {
  return !!((readBusNes(0x2001, nes) >> 1) & 1);
};

export const isSprLeftMost8Pix = (nes: Nes): boolean => {
  return !!((readBusNes(0x2001, nes) >> 2) & 1);
};

export const isDisableBg = (nes: Nes): boolean =>
  !!((readBusNes(0x2001, nes) >> 3) & 1);

export const isDisableSpr = (nes: Nes): boolean =>
  !!((readBusNes(0x2001, nes) >> 4) & 1);

export const shouldIgnoreWritesToVRAM = (nes: Nes): boolean =>
  !!((readBusNes(0x2002, nes) >> 4) & 1);

export const isMoreThan8SpritesOnScanLine = (nes: Nes): boolean =>
  !!((readBusNes(0x2002, nes) >> 5) & 1);

export const isZeroHitFlag = (nes: Nes): boolean =>
  !!((readBusNes(0x2002, nes) >> 6) & 1);

export const isVBlankOccurring = (nes: Nes): boolean =>
  !!((readBusNes(0x2002, nes) >> 7) & 1);

export const readSprAddr = (nes: Nes) => readBusNes(0x2003, nes);

const writeStatusRegister: Dictionary<
  PpuStatusRegister,
  (value: number, nes: Nes) => Nes
> = {
  hight: (value, nes) =>
    nesBuilder(nes)
      .ppuRegister(value << 8)
      .ppuStatusRegister("low")
      .build(),
  low: (value, nes) =>
    nesBuilder(nes)
      .ppuRegister(value | getPpuRegister(nes))
      .ppuStatusRegister("hight")
      .build(),
};

export const writePpuRegister = (value: number, nes: Nes): Nes => {
  return writeStatusRegister[getPpuRegisterStatus(nes)](value, nes);
};

export const getPpuRegister = (nes: Nes) => nes.ppu.register;

export const getPpuRegisterStatus = (nes: Nes) => nes.ppu.registerStatus;

export const writeSprRamRegister = (
  addr: number,
  value: number,
  nes: Nes
): Nes => {
  let _nes = writeSprRam(readSprAddr(nes), value, nes);
  _nes.bus[addr].data = value;
  return _nes;
};
