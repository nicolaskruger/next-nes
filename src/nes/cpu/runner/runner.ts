import { Nes, nesBuilder } from "@/nes/nes";
import { compile } from "../compiler/compiler";
import { Bus, readBus, simpleRead, simpleWrite } from "@/nes/bus/bus";
import { Cpu, getPC } from "../cpu";
import { instructionDictionary } from "../intructionDictionary/instructionDictionary";

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
  cycles: 0,
  PC: 0x8000,
  STATUS: 0,
  STK: 0xff,
  X: 0,
  Y: 0,
});
export const initNesRunner = (): Nes => ({
  cpu: initCpuRunner(),
  bus: initBusRunner(),
  ppu: {},
});

const compileNes = (program: number[], nes: Nes): Nes => {
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
    const fetch = readBus(PC, nes);
    const { addr, instruction, baseCycles, offsetCycles } =
      instructionDictionary[fetch];
    const addrResult = addr(nes);
    nes = instruction({
      baseCycles,
      ...addrResult,
      offsetOnCross: offsetCycles,
    });
  }
  return nes;
};

export { run };
