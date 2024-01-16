import { Bus, simpleRead, simpleWrite } from "@/nes/bus/bus";
import { Nes } from "@/nes/nes";

const getSprRam = (nes: Nes): Bus => nes.ppu.sprRam;

export const readSprRam = (addr: number, nes: Nes): number => {
  if (addr >= 0 && addr <= 0xff) return getSprRam(nes)[addr].data;
  throw new Error("PPU SPR-RAM out of range");
};

export const initSprRam = (): Bus =>
  "_"
    .repeat(0x100)
    .split("")
    .map((_) => ({ data: 0, read: simpleRead, write: simpleWrite }));
