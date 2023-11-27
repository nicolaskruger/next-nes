import { Bus } from "./bus/bus";
import { Cpu, setACC, setCycles } from "./cpu/cpu";
import { Ppu } from "./ppu/ppu";

type Nes = {
  cpu: Cpu;
  ppu: Ppu;
  bus: Bus;
};

const ACC = (nes: Nes) => (ACC: number) => {
  const _nes = setACC(ACC, nes);

  return nesBuilder(_nes);
};

const cycles = (nes: Nes) => (cycles: number) => {
  const _nes = setCycles(cycles, nes);

  return nesBuilder(_nes);
};

function nesBuilder(nes: Nes) {
  return {
    ACC: ACC(nes),
    cycles: cycles(nes),
    build: () => nes,
  };
}

export { nesBuilder };

export type { Nes };
