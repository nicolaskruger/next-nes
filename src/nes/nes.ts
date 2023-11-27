import { Bus, writeBus } from "./bus/bus";
import {
  Cpu,
  setACC,
  setCarryFlag,
  setCycles,
  setDecimalMode,
  setPC,
} from "./cpu/cpu";
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

const buss = (nes: Nes) => (addr: number, value: number) => {
  const _nes = writeBus(addr, value, nes);

  return nesBuilder(_nes);
};

const PC = (nes: Nes) => (PC: number) => {
  const _nes = setPC(PC, nes);
  return nesBuilder(_nes);
};

const carryFlag = (nes: Nes) => (flag: number) => {
  const _nes = setCarryFlag(flag, nes);

  return nesBuilder(_nes);
};

const decimalMode = (nes: Nes) => (flag: number) =>
  nesBuilder(setDecimalMode(flag, nes));

function nesBuilder(nes: Nes) {
  return {
    ACC: ACC(nes),
    cycles: cycles(nes),
    buss: buss(nes),
    PC: PC(nes),
    carryFlag: carryFlag(nes),
    decimalMode: decimalMode(nes),
    build: () => nes,
  };
}

export { nesBuilder };

export type { Nes };
