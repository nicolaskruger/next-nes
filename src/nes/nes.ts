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
import { Ppu, AddrVRamStatus, initPpu } from "./ppu/ppu";
import { Scroll, ScrollStatus, getScroll } from "./ppu/scroll/scroll";

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

export const getPpu = (nes: Nes) => nes.ppu;

export const getVRam = (nes: Nes) => nes.ppu.vram;

const buildNesPpu = (nes: Nes, addr: number, value: number) => {
  return {
    ...nes,
    ppu: {
      ...getPpu(nes),
      vram: getVRam(nes).map((b, bAddr) => {
        if (addr === bAddr) return { ...b, data: value };
        return b;
      }),
    },
  };
};

const bussPpu = (nes: Nes) => (addr: number, value: number) => {
  return nesBuilder(buildNesPpu(nes, addr, value));
};

const ppuRegister = (nes: Nes) => (value: number) => {
  return nesBuilder({ ...nes, ppu: { ...nes.ppu, addrVRam: value } });
};

const ppuStatusRegister = (nes: Nes) => (status: AddrVRamStatus) => {
  return nesBuilder({ ...nes, ppu: { ...nes.ppu, addrVramStatus: status } });
};

const addrVram = (nes: Nes) => (data: number) => {
  return nesBuilder({
    ...nes,
    ppu: {
      ...nes.ppu,
      addrVRam: data,
    },
  });
};

const ppu = (nes: Nes) => (ppu: Ppu) => {
  return nesBuilder({ ...nes, ppu: { ...nes.ppu, ...ppu } });
};

const scroll = (nes: Nes) => (scroll: Scroll) => {
  return nesBuilder(nes).ppu({
    scroll: { ...getScroll(nes), ...scroll },
  } as Ppu);
};

const scrollX = (nes: Nes) => (data: number) => {
  return nesBuilder(nes).scroll({ ...getScroll(nes), x: data });
};

const scrollY = (nes: Nes) => (data: number) => {
  return nesBuilder(nes).scroll({ ...getScroll(nes), y: data });
};

const scrollStatus = (nes: Nes) => (status: ScrollStatus) => {
  return nesBuilder(nes).scroll({ ...getScroll(nes), status });
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
    vram: bussPpu(nes),
    ppuRegister: ppuRegister(nes),
    ppuStatusRegister: ppuStatusRegister(nes),
    addrVram: addrVram(nes),
    ppu: ppu(nes),
    scroll: scroll(nes),
    scrollX: scrollX(nes),
    scrollStatus: scrollStatus(nes),
    scrollY: scrollY(nes),
  };
}

const initNes = (): Nes => ({
  bus: initBus(),
  cpu: initCpu(),
  ppu: initPpu(),
});

export { nesBuilder, initNes };

export type { Nes };
