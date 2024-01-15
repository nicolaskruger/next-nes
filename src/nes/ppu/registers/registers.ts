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

export const getSizeOfSprite = (nes: Nes): "8x8" | "8x16" => {
  throw new Error("not implemented");
};