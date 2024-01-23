import { Write, readBusNes, writeBusNes } from "@/nes/bus/bus";
import { Dictionary } from "@/nes/helper/dictionary";
import { setBit } from "@/nes/helper/set-bit";
import { Nes, nesBuilder } from "@/nes/nes";

export type ScrollStatus = "X" | "Y";

export type Scroll = {
  status: ScrollStatus;
  x: number;
  y: number;
};

export const initScroll = (): Scroll => ({
  status: "X",
  x: 0x00,
  y: 0x00,
});

export const getScroll = (nes: Nes) => nes.ppu.scroll;

export const getScrollStatus = (nes: Nes) => getScroll(nes).status;

export const getScrollX = (nes: Nes) => getScroll(nes).x;

export const getScrollY = (nes: Nes) => getScroll(nes).y;

const writeMSB2000 = (bit: number, position: number, nes: Nes): Nes => {
  let [reg2000, _nes] = readBusNes(0x2000, nes);
  return writeBusNes(0x2000, setBit(reg2000, bit, position), _nes);
};

const scrollDictionary: Dictionary<
  ScrollStatus,
  (value: number, nes: Nes) => Nes
> = {
  X: (value, nes) => {
    if (value >= 0 && value <= 255) {
      let _nes = writeMSB2000((value >> 7) & 1, 0, nes);
      return nesBuilder(_nes).scrollX(value).scrollStatus("Y").build();
    } else throw new Error("X scroll out of bound");
  },
  Y: (value, nes) => {
    if (value >= 0 && value <= 240) {
      let _nes = writeMSB2000((value >> 7) & 1, 1, nes);
      return nesBuilder(_nes).scrollY(value).scrollStatus("X").build();
    } else throw new Error("Y scroll out of bound");
  },
};

export const write2005scroll = (value: number, nes: Nes): Nes =>
  scrollDictionary[getScrollStatus(nes)](value, nes);
