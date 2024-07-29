import fs from "fs";
import { getPC } from "../cpu/cpu";
import { tick } from "../tick";
import { Nes, initNes } from "../nes";
import { rom } from "../rom/rom";
import { split } from "postcss/lib/list";
import { hexToDex } from "../helper/converter";

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

export const initRom = async (path: string) => {
  const romFile = fs.readFileSync(path);
  let nes = initNes();
  return await rom(nes, {
    arrayBuffer: async () => romFile,
    name: "demo.nes",
  } as unknown as File);
};

export const initNesTestRom = async () => {
  return initRom("./roms/nestest.nes");
};

export const initUnisinosRom = async () => {
  return initRom("./games/unisinos/unisinos.nes");
};

export const tickFor = (ms: number, nes: Nes): Nes => {
  let start = performance.now();
  while (performance.now() - start < ms) {
    nes = tick(nes).nes;
  }
  return nes;
};

export const tickConditional = (condition: (nes: Nes) => boolean, nes: Nes) => {
  while (condition(nes)) nes = tick(nes).nes;
  return nes;
};

type Code = {
  addr: number;
  instruction: string;
};

export const nesCode = (path: string): Code[] => {
  const code = fs.readFileSync(path).toString();
  return code
    .split("\n")
    .filter((line) => line)
    .map<Code>((line) => {
      const regex = /00:([0-9A-F]{4}):.{11}(\S{3})/g;
      const [_, addr, instruction] = regex.exec(line)!;
      return { instruction, addr: hexToDex(addr) };
    });
};

export const nesTestCode = (): Code[] => nesCode("./roms/nestest.txt");

export const initDemoRom = async () => {
  const romFile = fs.readFileSync("./games/demo/demo.nes");
  let nes = initNes();
  return await rom(nes, {
    arrayBuffer: async () => romFile,
    name: "demo.nes",
  } as unknown as File);
};
