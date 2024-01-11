import { Bus, initBus, writeBusNes } from "./bus/bus";
import {
  Cpu,
  initCpu,
  setACC,
  setCarryFlag,
  setCycles,
  setDecimalMode,
  setInterruptDisable,
  setOverFlowFlag,
  setPC,
  setSTATUS,
  setX,
  setY,
} from "./cpu/cpu";
import {
  CalculateCycles,
  calculateCycles,
  pushToStack,
} from "./cpu/instruction/instruction";
import { Ppu, initPpu } from "./ppu/ppu";

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
  const _nes = writeBusNes(addr, value, nes);

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

const X = (nes: Nes) => (X: number) => {
  const _nes = setX(X, nes);
  return nesBuilder(_nes);
};

const Y = (nes: Nes) => (Y: number) => {
  const _nes = setY(Y, nes);
  return nesBuilder(_nes);
};

const directWriteBus = (nes: Nes) => (addr: number, value: number) => {
  const bus: Bus = nes.bus.map((b, i) => {
    if (addr === i) return { ...b, data: value };
    return b;
  });
  const _nes: Nes = { ...nes, bus };

  return nesBuilder(_nes);
};

const allBus = (nes: Nes) => (bus: Bus) => {
  const _nes: Nes = { ...nes, bus };

  return nesBuilder(_nes);
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
    Y: Y(nes),
    X: X(nes),
    build: () => nes,
    allBus: allBus(nes),
    directWrite: directWriteBus(nes),
  };
}

const initNes = (): Nes => ({
  bus: initBus(),
  cpu: initCpu(),
  ppu: initPpu(),
});

export { nesBuilder, initNes };

export type { Nes };
