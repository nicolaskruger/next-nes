import { Nes } from "../nes";

type Cpu = {
  PC: number;
  STK: number;
  ACC: number;
  X: number;
  Y: number;
  STATUS: number;
};

type FlagOperator = {
  result: number;
  a?: number;
  b?: number;
  data?: number;
};

type FlagBuilder = {
  flag: (result: FlagOperator) => number;
  set: (value: number, nes: Nes) => Nes;
};

const getCarryFlag = (nes: Nes): number => nes.cpu.STATUS & 1;
const getZeroFlag = (nes: Nes): number => (nes.cpu.STATUS >> 1) & 1;
const getInterruptDisable = (nes: Nes): number => (nes.cpu.STATUS >> 2) & 1;
const getDecimalMode = (nes: Nes): number => (nes.cpu.STATUS >> 3) & 1;
const getBreakCommand = (nes: Nes): number => (nes.cpu.STATUS >> 4) & 1;
const getOverFlowFlag = (nes: Nes): number => (nes.cpu.STATUS >> 5) & 1;
const getNegativeFlag = (nes: Nes): number => (nes.cpu.STATUS >> 6) & 1;

const setCpu = (key: keyof Cpu, value: number, nes: Nes): Nes => ({
  ...nes,
  cpu: { ...nes.cpu, [key]: value },
});
const setACC = (value: number, nes: Nes) => setCpu("ACC", value, nes);
const setX = (value: number, nes: Nes) => setCpu("X", value, nes);
const setY = (value: number, nes: Nes) => setCpu("Y", value, nes);
const setPC = (value: number, nes: Nes) => setCpu("PC", value, nes);
const setSTK = (value: number, nes: Nes) => setCpu("STK", value, nes);

const getCpu = (key: keyof Cpu, nes: Nes): number => nes.cpu[key];
const getACC = (nes: Nes): number => getCpu("ACC", nes);
const getX = (nes: Nes): number => getCpu("X", nes);
const getY = (nes: Nes): number => getCpu("Y", nes);
const getPC = (nes: Nes): number => getCpu("PC", nes);
const getSTK = (nes: Nes): number => getCpu("STK", nes);
const getSTATUS = (nes: Nes): number => getCpu("STATUS", nes);

const setFlag = (value: number, offset: number, nes: Nes): Cpu => ({
  ...nes.cpu,
  STATUS: value
    ? nes.cpu.STATUS | (1 << offset)
    : nes.cpu.STATUS & ~(1 << offset),
});

const setCarryFlag = (value: number, nes: Nes): Nes => ({
  ...nes,
  cpu: setFlag(value, 0, nes),
});
const setZeroFlag = (value: number, nes: Nes): Nes => ({
  ...nes,
  cpu: setFlag(value, 1, nes),
});
const setInterruptDisable = (value: number, nes: Nes): Nes => ({
  ...nes,
  cpu: setFlag(value, 2, nes),
});
const setDecimalMode = (value: number, nes: Nes): Nes => ({
  ...nes,
  cpu: setFlag(value, 3, nes),
});
const setBreakCommand = (value: number, nes: Nes): Nes => ({
  ...nes,
  cpu: setFlag(value, 4, nes),
});
const setOverFlowFlag = (value: number, nes: Nes): Nes => ({
  ...nes,
  cpu: setFlag(value, 5, nes),
});
const setNegativeFlag = (value: number, nes: Nes): Nes => ({
  ...nes,
  cpu: setFlag(value, 6, nes),
});

const isOverFlow = (result: number, a: number, b: number) =>
  (is8bitsNegative(result) && is8bitsPositive(a) && is8bitsPositive(b)) ||
  (is8bitsPositive(result) && is8bitsNegative(a) && is8bitsNegative(b));
const is8bitsNegative = (value: number) => ((value >> 7) & 1) === 1;
const is8bitsPositive = (value: number) => !is8bitsNegative(value);

const CARRY_SHIFT_RIGHT: FlagBuilder = {
  flag: ({ data }) => data as number & 1,
  set: setCarryFlag,
};

const CARRY: FlagBuilder = {
  flag: ({ result }) => (result & 0x100) >> 8,
  set: setCarryFlag,
};

const ZERO: FlagBuilder = {
  flag: ({ result }) => ((result & 0xff) === 0 ? 1 : 0),
  set: setZeroFlag,
};

const OVERFLOW: FlagBuilder = {
  flag: ({ result, a, b }) =>
    isOverFlow(result, a as number, b as number) ? 1 : 0,
  set: setOverFlowFlag,
};

const NEGATIVE: FlagBuilder = {
  flag: ({ result }) => (result >> 7) & 1,
  set: setNegativeFlag,
};

const flagBuilder = (
  result: FlagOperator,
  nes: Nes,
  flags: FlagBuilder[]
): Nes => flags.reduce((acc, curr) => curr.set(curr.flag(result), acc), nes);

export {
  getCarryFlag,
  getZeroFlag,
  getInterruptDisable,
  getDecimalMode,
  getBreakCommand,
  getOverFlowFlag,
  getNegativeFlag,
  setCarryFlag,
  setZeroFlag,
  setInterruptDisable,
  setDecimalMode,
  setBreakCommand,
  setOverFlowFlag,
  setNegativeFlag,
  flagBuilder,
  setX,
  setY,
  setSTK,
  setPC,
  setACC,
  getACC,
  getCpu,
  getPC,
  getSTK,
  getX,
  getY,
  getSTATUS,
  NEGATIVE,
  CARRY,
  OVERFLOW,
  ZERO,
  CARRY_SHIFT_RIGHT,
};

export type { Cpu };
