import { Nes, nesBuilder } from "../nes";

type Cpu = {
  PC: number;
  STK: number;
  ACC: number;
  X: number;
  Y: number;
  STATUS: number;
  cycles: number;
};

type FlagResult = {
  result: number;
  a?: number;
  b?: number;
  data?: number;
};

type FlagBuilder = {
  flag: (result: FlagResult) => number;
  set: (value: number, nes: Nes) => Nes;
};

const getCarryFlag = (nes: Nes): number => nes.cpu.STATUS & 1;
const getZeroFlag = (nes: Nes): number => (nes.cpu.STATUS >> 1) & 1;
const getInterruptDisable = (nes: Nes): number => (nes.cpu.STATUS >> 2) & 1;
const getDecimalMode = (nes: Nes): number => (nes.cpu.STATUS >> 3) & 1;
const getBreakCommand = (nes: Nes): number => (nes.cpu.STATUS >> 4) & 1;
const getOverFlowFlag = (nes: Nes): number => (nes.cpu.STATUS >> 5) & 1;
const getNegativeFlag = (nes: Nes): number => (nes.cpu.STATUS >> 6) & 1;

const setCpu = (key: keyof Cpu, value: number, nes: Nes): Nes => {
  nes.cpu[key] = value;
  return nes;
};
const setACC = (value: number, nes: Nes) => setCpu("ACC", value, nes);
const setX = (value: number, nes: Nes) => setCpu("X", value, nes);
const setY = (value: number, nes: Nes) => setCpu("Y", value, nes);
const setPC = (value: number, nes: Nes) => setCpu("PC", value, nes);
const setSTK = (value: number, nes: Nes) => setCpu("STK", value, nes);
const setSTATUS = (value: number, nes: Nes) => setCpu("STATUS", value, nes);
const setCycles = (value: number, nes: Nes) => setCpu("cycles", value, nes);

const getCpu = (key: keyof Cpu, nes: Nes): number => nes.cpu[key];
const getACC = (nes: Nes): number => getCpu("ACC", nes);
const getX = (nes: Nes): number => getCpu("X", nes);
const getY = (nes: Nes): number => getCpu("Y", nes);
const getPC = (nes: Nes): number => getCpu("PC", nes);
const getSTK = (nes: Nes): number => getCpu("STK", nes);
const getSTATUS = (nes: Nes): number => getCpu("STATUS", nes);

export const setFlag = (value: number, offset: number, nes: Nes): Cpu => {
  nes.cpu.STATUS = value
    ? nes.cpu.STATUS | (1 << offset)
    : nes.cpu.STATUS & ~(1 << offset);
  return nes.cpu;
};

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
  flag: ({ data }) => (data as number) & 1,
  set: setCarryFlag,
};

const CARRY: FlagBuilder = {
  flag: ({ result }) => (result & 0x100) >> 8,
  set: setCarryFlag,
};

const CARRY_SUBTRACT: FlagBuilder = {
  flag: ({ result }) => (result & 0x100) >> 8,
  set: (v, nes) => setCarryFlag(~v & 1, nes),
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

const flagOperator = (
  result: FlagResult,
  nes: Nes,
  flagOperator: FlagBuilder
) => {
  return flagOperator.set(flagOperator.flag(result), nes);
};

const carryShiftRight = (result: FlagResult, nes: Nes) => () => {
  const _nes = flagOperator(result, nes, CARRY_SHIFT_RIGHT);
  return flagBuilder(result, _nes);
};

const carry = (result: FlagResult, nes: Nes) => () => {
  const _nes = flagOperator(result, nes, CARRY);
  return flagBuilder(result, _nes);
};

const carrySubtract = (result: FlagResult, nes: Nes) => () => {
  const _nes = flagOperator(result, nes, CARRY_SUBTRACT);
  return flagBuilder(result, _nes);
};
const zero = (result: FlagResult, nes: Nes) => () => {
  const _nes = flagOperator(result, nes, ZERO);
  return flagBuilder(result, _nes);
};

const overFlow = (result: FlagResult, nes: Nes) => () => {
  const _nes = flagOperator(result, nes, OVERFLOW);
  return flagBuilder(result, _nes);
};

const negative = (result: FlagResult, nes: Nes) => () => {
  const _nes = flagOperator(result, nes, NEGATIVE);
  return flagBuilder(result, _nes);
};

const customFlagBuilder =
  (result: FlagResult, nes: Nes) => (customFlagBuilder: FlagBuilder) => {
    const _nes = flagOperator(result, nes, customFlagBuilder);
    return flagBuilder(result, _nes);
  };

function flagBuilder(result: FlagResult, nes: Nes) {
  return {
    negative: negative(result, nes),
    overFlow: overFlow(result, nes),
    zero: zero(result, nes),
    carry: carry(result, nes),
    carryShiftRight: carryShiftRight(result, nes),
    nesBuilder: () => nesBuilder(nes),
    customFlagBuilder: customFlagBuilder(result, nes),
    carrySubtract: carrySubtract(result, nes),
    build: () => nes,
  };
}

export const getCycles = (nes: Nes) => nes.cpu.cycles;

const initCpu = (): Cpu => ({
  ACC: 0,
  PC: 0x8000,
  STATUS: 0,
  STK: 0xff,
  X: 0,
  Y: 0,
  cycles: 0,
});

export {
  initCpu,
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
  setSTATUS,
  getACC,
  getCpu,
  getPC,
  getSTK,
  getX,
  getY,
  getSTATUS,
  setCycles,
  NEGATIVE,
  CARRY,
  OVERFLOW,
  ZERO,
  CARRY_SHIFT_RIGHT,
};

export type { Cpu };
