import { Bus, writeBus } from "./bus/bus";
import {
  Cpu,
  setACC,
  setCarryFlag,
  setCycles,
  setDecimalMode,
  setInterruptDisable,
  setOverFlowFlag,
  setPC,
  setSTATUS,
} from "./cpu/cpu";
import {
  CalculateCycles,
  calculateCycles,
  pushToStack,
} from "./cpu/instruction/instruction";
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

const decimalMode = (nes: Nes) => (flag: number) => {
  const _nes = setDecimalMode(flag, nes);
  return nesBuilder(_nes);
};
const interruptDisable = (nes: Nes) => (flag: number) => {
  const _nes = setInterruptDisable(flag, nes);

  return nesBuilder(_nes);
};

const overFlow = (nes: Nes) => (flag: number) => {
  const _nes = setOverFlowFlag(flag, nes);

  return nesBuilder(_nes);
};

const pushStack = (nes: Nes) => (data: number) => {
  const _nes = pushToStack(nes, data);

  return nesBuilder(_nes);
};

const calcCycles = (nes: Nes) => (cyclesData: CalculateCycles) => {
  const cycles = calculateCycles(cyclesData);

  return nesBuilder(nes).cycles(cycles);
};

const status = (nes: Nes) => (status: number) => {
  const _nes = setSTATUS(status, nes);
  return nesBuilder(_nes);
};

const customSet =
  (nes: Nes) => (value: number, set: (value: number, nes: Nes) => Nes) => {
    return nesBuilder(set(value, nes));
  };

function nesBuilder(nes: Nes) {
  return {
    ACC: ACC(nes),
    cycles: cycles(nes),
    buss: buss(nes),
    PC: PC(nes),
    carryFlag: carryFlag(nes),
    decimalMode: decimalMode(nes),
    interruptDisable: interruptDisable(nes),
    overFlow: overFlow(nes),
    pushToStack: pushStack(nes),
    calcCycles: calcCycles(nes),
    customSet: customSet(nes),
    status: status(nes),
    build: () => nes,
  };
}

export { nesBuilder };

export type { Nes };
