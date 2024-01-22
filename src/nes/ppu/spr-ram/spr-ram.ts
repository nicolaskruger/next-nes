import { Bus, Read, Write } from "@/nes/bus/bus";
import { repeat } from "@/nes/helper/repeat";
import { Nes } from "@/nes/nes";

const getSprRam = (nes: Nes): Bus => nes.ppu.sprRam;

const simpleReadSprRam: Read = (addr, nes) => [getSprRam(nes)[addr].data, nes];

const simpleWriteSprRam: Write = (addr, value, nes) => {
  getSprRam(nes)[addr].data = value;
  return nes;
};

export const readSprRam: Read = (addr, nes) => {
  if (addr >= 0 && addr <= 0xff) return getSprRam(nes)[addr].read(addr, nes);
  throw new Error("PPU SPR-RAM out of range");
};

export const writeSprRam: Write = (addr, value, nes) => {
  if (addr >= 0 && addr <= 0xff)
    return getSprRam(nes)[addr].write(addr, value, nes);
  throw new Error("PPU SPR-RAM out of range");
};

export const initSprRam = (): Bus =>
  repeat(0x100).map((_) => ({
    data: 0,
    read: simpleReadSprRam,
    write: simpleWriteSprRam,
  }));
