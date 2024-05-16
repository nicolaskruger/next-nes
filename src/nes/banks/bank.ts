import { writeBusNes } from "../bus/bus";
import { repeat } from "../helper/repeat";
import { Nes } from "../nes";
import { writeVRam } from "../ppu/vram/vram";

export type Banks = {
  prgRom: number[][];
  chrRom: number[][];
};

export const initBanks = (): Banks => ({
  prgRom: [],
  chrRom: [],
});

export const bankSize = (times: number): number[][] =>
  repeat(times).map((_) => []);

export const getPrgRom = (nes: Nes) => nes.banks.prgRom;
export const getChrRom = (nes: Nes) => nes.banks.chrRom;
export const setPrgRom = (nes: Nes, rom: number[][]) => {
  nes.banks.prgRom = rom;
  return nes;
};
export const setChrRom = (nes: Nes, rom: number[][]) => {
  nes.banks.chrRom = rom;
  return nes;
};

export const startPrgRom = (nes: Nes): Nes => {
  const prgRom = getPrgRom(nes);
  return prgRom[0].reduce((acc, curr, i) => {
    return writeBusNes(0x8000 + i, curr, acc);
  }, nes);
};

export const startChrRom = (nes: Nes): Nes => {
  const chrRom = getChrRom(nes);
  return chrRom[0].reduce((acc, curr, i) => {
    return writeVRam(i, curr, acc);
  }, nes);
};
