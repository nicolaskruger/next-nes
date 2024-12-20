import { Banks, initBanks } from "./banks/bank";
import { Bus, initBus, writeBusNes } from "./bus/bus";
import { initControl, NesControl } from "./control/control";
import {
  Cpu,
  initCpu,
  setACC,
  setBreakCommand,
  setCarryFlag,
  setDecimalMode,
  setInterruptDisable,
  setOverFlowFlag,
  setPC,
  setSTATUS,
  setX,
  setY,
} from "./cpu/cpu";
import {
  NMI,
  pullPCStack,
  pushPCStack,
  pushToStack,
} from "./cpu/instruction/instruction";
import { Ppu, initPpu } from "./ppu/ppu";
import { Scroll, ScrollStatus, getScroll } from "./ppu/scroll/scroll";
import { AddrVRamStatus, VRam } from "./ppu/vram/vram";
import { Track } from "./track/track";

type Nes = {
  cpu: Cpu;
  ppu: Ppu;
  bus: Bus;
  banks: Banks;
  control: NesControl;
  track?: Track;
};

const ACC = (nes: Nes) => (ACC: number) => {
  const _nes = setACC(ACC, nes);

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
  nes.bus[addr].data = value;
  return nesBuilder(nes);
};

const allBus = (nes: Nes) => (bus: Bus) => {
  const _nes: Nes = { ...nes, bus };

  return nesBuilder(_nes);
};

export const getPpu = (nes: Nes) => nes.ppu;

export const getVRam = (nes: Nes) => nes.ppu.vram;

export const getVRamBus = (nes: Nes) => nes.ppu.vram.bus;

const buildNesPpu = (nes: Nes, addr: number, value: number) => {
  getVRamBus(nes)[addr].data = value;
  return nes;
};

const bussPpu = (nes: Nes) => (addr: number, value: number) => {
  return nesBuilder(buildNesPpu(nes, addr, value));
};

const vram = (nes: Nes) => (vram: VRam) => {
  return nesBuilder(nes).ppu({ vram: { ...getVRam(nes), ...vram } } as Ppu);
};

const addrVram = (nes: Nes) => (value: number) => {
  return nesBuilder(nes).vram({ addr: value } as VRam);
};

const addrStatusVRam = (nes: Nes) => (status: AddrVRamStatus) => {
  return nesBuilder(nes).vram({ addrStatus: status } as VRam);
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

const firstReadPpu = (nes: Nes) => (firstRead: boolean) => {
  return nesBuilder(nes).vram({ firstRead } as VRam);
};

const nmi = (nes: Nes) => () => nesBuilder(NMI(nes));

function nesBuilder(nes: Nes) {
  return {
    ACC: ACC(nes),
    buss: buss(nes),
    PC: PC(nes),
    carryFlag: carryFlag(nes),
    decimalMode: decimalMode(nes),
    interruptDisable: interruptDisable(nes),
    overFlow: overFlow(nes),
    pushToStack: pushStack(nes),
    customSet: customSet(nes),
    status: status(nes),
    Y: Y(nes),
    X: X(nes),
    build: () => nes,
    allBus: allBus(nes),
    directWrite: directWriteBus(nes),
    vramBus: bussPpu(nes),
    ppuRegister: addrVram(nes),
    ppuStatusRegister: addrStatusVRam(nes),
    addrVram: addrVram(nes),
    ppu: ppu(nes),
    scroll: scroll(nes),
    scrollX: scrollX(nes),
    scrollStatus: scrollStatus(nes),
    scrollY: scrollY(nes),
    firstReadPpu: firstReadPpu(nes),
    vram: vram(nes),
    NMI: nmi(nes),
    pushPCStack: (pc: number) => nesBuilder(pushPCStack(nes, pc)),
    pullPCStack: () => {
      let [PC, _nes] = pullPCStack(nes);
      return nesBuilder(_nes).PC(PC);
    },
    pullPCStackNext: () => {
      let [PC, _nes] = pullPCStack(nes);
      return nesBuilder(_nes).PC(PC + 1);
    },
    setBreakCommand: (value: number) => nesBuilder(setBreakCommand(value, nes)),
  };
}

const initNes = (): Nes => ({
  bus: initBus(),
  cpu: initCpu(),
  ppu: initPpu(),
  banks: initBanks(),
  control: initControl(),
});

export { nesBuilder, initNes };

export type { Nes };
