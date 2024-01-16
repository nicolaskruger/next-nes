import { readBusNes } from "@/nes/bus/bus";
import { Nes } from "@/nes/nes";

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
