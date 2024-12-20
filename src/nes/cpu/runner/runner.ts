import { Nes, nesBuilder } from "@/nes/nes";
import { compile } from "../compiler/compiler";
import { Bus, readBusNes, simpleRead, simpleWrite } from "@/nes/bus/bus";
import { Cpu, getPC } from "../cpu";
import { instructionDictionary } from "../intructionDictionary/instructionDictionary";
import { initVram } from "@/nes/ppu/vram/vram";
import { initSprRam } from "@/nes/ppu/spr-ram/spr-ram";
import { initPpu } from "@/nes/ppu/ppu";
import { initInterrupt } from "../interrupt/interrupt";
import { initBanks } from "@/nes/banks/bank";

const initBusRunner = (): Bus =>
  "_"
    .repeat(0x10000)
    .split("")
    .map((_) => ({
      data: 0,
      read: simpleRead,
      write: simpleWrite,
    }));

const initCpuRunner = (): Cpu => ({
  ACC: 0,
  PC: 0x8000,
  STATUS: 0,
  STK: 0xff,
  X: 0,
  Y: 0,
  interrupt: initInterrupt(),
});
export const initNesRunner = (): Nes => ({
  cpu: initCpuRunner(),
  bus: initBusRunner(),
  ppu: initPpu(),
  banks: initBanks(),
});

export const compileNes = (program: number[], nes: Nes): Nes => {
  const bus: Bus = nes.bus.map((bus, i) => {
    const data = program[i - 0x8000] | bus.data;
    return { ...bus, data };
  });

  return nesBuilder(nes).allBus(bus).build();
};

const run = async (program: string): Promise<Nes> => {
  const comp = compile(program);
  if (comp.length > 32768) throw new Error("to long program max 32768 bytes");

  let nes = initNesRunner();
  nes = compileNes(comp, nes);

  while (getPC(nes) < 0x8000 + comp.length) {
    const PC = getPC(nes);
    const [fetch, nesFetch] = readBusNes(PC, nes);
    nes = nesFetch;
    const { addr, instruction } = instructionDictionary[fetch];
    nes = instruction(addr(nes));
  }
  return nes;
};

export { run };
