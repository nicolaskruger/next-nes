import { Bus, Read, Write } from "@/nes/bus/bus";
import { repeat } from "@/nes/helper/repeat";
import { Nes } from "@/nes/nes";

export type ReadRange = [number[], Nes];

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

export const readRangeSprRam = (
  startIndex: number,
  length: number,
  nes: Nes
) => {
  return repeat(length).reduce(
    ([values, nes], _, index) => {
      const [data, _nes] = readSprRam(index + startIndex, nes);
      return [[...values, data], _nes] as ReadRange;
    },
    [[], nes] as ReadRange
  );
};

export type BgPos = "front" | "back";

export type SprInfo = {
  y: number;
  x: number;
  tile: number;
  pallet: number;
  bgPos: BgPos;
  horizontalMirror: boolean;
  verticalMirror: boolean;
};

export const readSprInfo = (index: number, nes: Nes): [SprInfo, Nes] => {
  const [[y, tile, info, x], _nes] = readRangeSprRam(index * 4, 4, nes);
  const pallet = info & 3;
  const bgPos: BgPos = (info >> 5) & 1 ? "back" : "front";
  const horizontalMirror = Boolean((info >> 7) & 1);
  const verticalMirror = Boolean((info >> 6) & 1);

  const sprInfo: SprInfo = {
    y,
    x,
    tile,
    pallet,
    bgPos,
    horizontalMirror,
    verticalMirror,
  };
  return [sprInfo, _nes];
};

export const initSprRam = (): Bus =>
  repeat(0x100).map((_) => ({
    data: 0,
    read: simpleReadSprRam,
    write: simpleWriteSprRam,
  }));
