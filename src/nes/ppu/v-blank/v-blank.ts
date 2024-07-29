import { Nes } from "@/nes/nes";
import { toggleVBlank } from "../registers/registers";
import { NMI } from "@/nes/cpu/instruction/instruction";
import { getCycles } from "@/nes/cpu/cpu";

export const MAX_CYCLES = 100;

export type VBlank = {
  cycles: number;
};

export const initVBlank = (): VBlank => ({
  cycles: 0,
});

const getVBlank = (nes: Nes) => nes.ppu.vBlank;

export const vBlack = (nes: Nes): Nes => {
  const vBlack = getVBlank(nes);
  vBlack.cycles += getCycles(nes);
  if (vBlack.cycles < MAX_CYCLES) return nes;
  vBlack.cycles = 0;
  return [NMI, toggleVBlank].reduce((acc, curr) => curr(acc), nes);
};
