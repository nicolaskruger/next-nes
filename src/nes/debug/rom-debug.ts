import fs from "fs";
import { getPC } from "../cpu/cpu";
import { tick } from "../tick";
import { Nes, initNes } from "../nes";
import { rom } from "../rom/rom";

export const tickUntilTimes = (addr: number, times: number, nes: Nes): Nes => {
  while (times) {
    if (getPC(nes) === addr) --times;
    nes = tick(nes).nes;
  }
  return nes;
};

export const tickUntil = (addr: number, nes: Nes): Nes => {
  while (getPC(nes) !== addr) {
    nes = tick(nes).nes;
  }
  return nes;
};

export const tickUntilEndDemoRom = (nes: Nes) => tickUntil(0x805e, nes);

export const initDemoRom = async () => {
  const romFile = fs.readFileSync("./games/demo/demo.nes");
  let nes = initNes();
  return await rom(nes, {
    arrayBuffer: async () => romFile,
    name: "demo.nes",
  } as unknown as File);
};
