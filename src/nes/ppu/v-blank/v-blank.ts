import { Nes } from "@/nes/nes";
import { isNMIOccur, toggleVBlack } from "../registers/registers";
import { NMI } from "@/nes/cpu/instruction/instruction";

export const MAX_CYCLES = 400;

export type VBlank = {
  cycles: number;
};

export const initVBlank = (): VBlank => ({
  cycles: 0,
});

const getVBlank = (nes: Nes) => nes.ppu.vBlank;

export const vBlack = (nes: Nes, cycles: number): Nes => {
  const vBlack = getVBlank(nes);
  vBlack.cycles += cycles;
  if (vBlack.cycles < MAX_CYCLES) return nes;

  const [nmi, nmiNes] = isNMIOccur(nes);
  const reducerNes: ((nes: Nes) => Nes)[] = [];
  if (nmi) reducerNes.push(NMI);
  reducerNes.push(toggleVBlack);
  return reducerNes.reduce((acc, curr) => curr(acc), nmiNes);
};
