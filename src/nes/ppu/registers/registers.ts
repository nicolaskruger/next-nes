import { readBusNes } from "@/nes/bus/bus";
import { Nes } from "@/nes/nes";

export const getNameTable = (nes: Nes): number => {
  const data = readBusNes(0x2000, nes) & (1 | (1 << 1));
  return [0x2000, 0x2400, 0x2800, 0x2c00][data];
};
