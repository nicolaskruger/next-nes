import { Nes } from "@/nes/nes";
import {
  CARRY,
  CARRY_SHIFT_RIGHT,
  NEGATIVE,
  OVERFLOW,
  ZERO,
  flagBuilder,
  getACC,
  getCarryFlag,
  getNegativeFlag,
  getOverFlowFlag,
  getSTATUS,
  getSTK,
  getX,
  getY,
  getZeroFlag,
  setACC,
  setBreakCommand,
  setCarryFlag,
  setDecimalMode,
  setInterruptDisable,
  setNegativeFlag,
  setOverFlowFlag,
  setPC,
  setSTATUS,
  setSTK,
  setX,
  setY,
  setZeroFlag,
} from "../cpu";
import { MASK_8 } from "@/nes/helper/mask";
import { readBus, writeBus } from "@/nes/bus/bus";

type InstructionData = {
  nes: Nes;
  data: number;
  baseCycles: number;
  cross: boolean;
  offsetOnCross: number;
  acc?: boolean;
  addr?: number;
};

type InstructionReturn = {
  nes: Nes;
  totalCycle: number;
};

type CalculateCycles = Pick<
  InstructionData,
  "baseCycles" | "cross" | "offsetOnCross"
>;

const is8bitsNegative = (value: number) => ((value >> 7) & 1) === 1;

const make8bitSigned = (value: number) => {
  if (is8bitsNegative(value)) return ~0xff | value;
  return value;
};

const calculateCycles = ({
  baseCycles,
  cross,
  offsetOnCross,
}: CalculateCycles) => baseCycles + (cross ? offsetOnCross : 0);

const ADC = ({
  data,
  nes,
  baseCycles,
  cross,
  offsetOnCross,
}: InstructionData): InstructionReturn => {
  const { cpu } = nes;
  const CARRY_FLAG = getCarryFlag(nes);
  const { ACC } = cpu;
  const result = data + CARRY_FLAG + ACC;

  const totalCycle = baseCycles + (cross ? offsetOnCross : 0);

  const _nes = flagBuilder({ result, a: data, b: ACC }, nes, [
    CARRY,
    ZERO,
    OVERFLOW,
    NEGATIVE,
  ]);

  return {
    totalCycle,
    nes: setACC(result & MASK_8, _nes),
  };
};

const AND = ({
  nes,
  data,
  baseCycles,
  cross,
  offsetOnCross,
}: InstructionData): InstructionReturn => {
  const { cpu } = nes;
  const { ACC } = cpu;

  const result = ACC & data;

  const _nes = flagBuilder({ result }, nes, [ZERO, NEGATIVE]);

  const totalCycle = calculateCycles({ baseCycles, cross, offsetOnCross });

  return {
    totalCycle,
    nes: setACC(result, _nes),
  };
};

const ASL_ACC = ({
  data,
  nes,
  ...cycles
}: InstructionData): InstructionReturn => {
  const result = data << 1;

  const _nes = flagBuilder({ result }, nes, [CARRY, ZERO, NEGATIVE]);

  const totalCycle = calculateCycles({ ...cycles });

  return {
    nes: setACC(result & MASK_8, _nes),
    totalCycle,
  };
};

const ASL_MEMORY = ({
  data,
  nes,
  addr,
  ...cycles
}: InstructionData): InstructionReturn => {
  if (addr === undefined)
    throw new Error("this instruction needs memory addr.");

  const _nes = flagBuilder({ result }, nes, [CARRY, ZERO, NEGATIVE]);

  const totalCycle = calculateCycles({ ...cycles });

  return {
    nes: writeBus(addr, result & MASK_8, _nes),
    totalCycle,
  };
};

const ASL = (instruction: InstructionData): InstructionReturn => {
  const { acc } = instruction;

  if (acc) {
    return ASL_ACC(instruction);
  } else {
    return ASL_MEMORY(instruction);
  }
};

const branch = (
  getFlag: (nes: Nes) => number,
  verify: (flag: number) => boolean,
  { nes, data, baseCycles }: InstructionData
): InstructionReturn => {
  const flag = getFlag(nes);

  if (verify(flag)) {
    return {
      nes,
      totalCycle: baseCycles,
    };
  }

  let extraCycles = 1;

  const { cpu } = nes;

  const PC = cpu.PC + data;

  if (PC >> 8 !== cpu.PC >> 8) extraCycles += 2;

  return {
    nes: setPC(PC, nes),
    totalCycle: baseCycles + extraCycles,
  };
};

const clearFlag = (value: number) => !!value;
const setFlag = (value: number) => !value;

const BCC = (instruction: InstructionData): InstructionReturn => {
  return branch(getCarryFlag, clearFlag, instruction);
};

const BCS = (instruction: InstructionData): InstructionReturn => {
  return branch(getCarryFlag, setFlag, instruction);
};

const BEQ = (instruction: InstructionData): InstructionReturn => {
  return branch(getZeroFlag, setFlag, instruction);
};

const BIT = ({ nes, data, baseCycles }: InstructionData): InstructionReturn => {
  const result = data & nes.cpu.ACC;

  const _nes = flagBuilder({ result }, nes, [
    {
      set: setCarryFlag,
      flag: ({ result }) => (result === 0 ? 1 : 0),
    },
    {
      set: setOverFlowFlag,
      flag: ({ result }) => (result >> 6) & 1,
    },
    {
      set: setNegativeFlag,
      flag: ({ result }) => (result >> 7) & 1,
    },
  ]);

  return {
    nes: _nes,
    totalCycle: baseCycles,
  };
};

const BMI = (instruction: InstructionData): InstructionReturn => {
  return branch(getNegativeFlag, setFlag, instruction);
};

const BNE = (instruction: InstructionData): InstructionReturn => {
  return branch(getZeroFlag, clearFlag, instruction);
};

const BPL = (instruction: InstructionData): InstructionReturn => {
  return branch(getNegativeFlag, clearFlag, instruction);
};

const pushToStack = (nes: Nes, data: number): Nes => {
  let STK = nes.cpu.STK;
  if (STK < 0) throw new Error("stack overflow");
  const newNes = writeBus(0x0100 | STK, data, nes);
  STK--;
  return setSTK(STK, newNes);
};

const pullFromStack = (nes: Nes): [value: number, nes: Nes] => {
  let STK = getSTK(nes);
  STK++;
  if (STK > 0xff) throw new Error("stack overflow");
  const value = readBus(0x0100 | STK, nes);
  return [value, setSTK(STK, nes)];
};

const BRK = ({ nes, baseCycles }: InstructionData): InstructionReturn => {
  let newNes = [nes.cpu.PC, nes.cpu.STATUS].reduce(
    (acc, curr) => pushToStack(acc, curr),
    nes
  );

  newNes = setBreakCommand(1, newNes);

  return {
    totalCycle: baseCycles,
    nes: setPC(0xfffe, newNes),
  };
};

const BVC = (instruction: InstructionData): InstructionReturn => {
  return branch(getOverFlowFlag, clearFlag, instruction);
};

const BVS = (instruction: InstructionData): InstructionReturn => {
  return branch(getOverFlowFlag, setFlag, instruction);
};

const CLC = ({ nes, baseCycles }: InstructionData): InstructionReturn => {
  return {
    nes: setCarryFlag(0, nes),
    totalCycle: baseCycles,
  };
};

const CLD = ({ nes, baseCycles }: InstructionData): InstructionReturn => {
  return {
    nes: setDecimalMode(0, nes),
    totalCycle: baseCycles,
  };
};
const CLI = ({ nes, baseCycles }: InstructionData): InstructionReturn => {
  return {
    nes: setInterruptDisable(0, nes),
    totalCycle: baseCycles,
  };
};
const CLV = ({ nes, baseCycles }: InstructionData): InstructionReturn => {
  return {
    nes: setOverFlowFlag(0, nes),
    totalCycle: baseCycles,
  };
};
const compare = (
  value: number,
  { data, nes, ...cycles }: InstructionData
): InstructionReturn => {
  const signedValue = make8bitSigned(value);
  const signedData = make8bitSigned(data);

  const newNes = [
    {
      verify: signedValue >= signedData,
      set: setCarryFlag,
    },
    {
      verify: signedValue === signedData,
      set: setZeroFlag,
    },
    {
      verify: ((signedValue - signedData) & (1 << 7)) === 1 << 7,
      set: setNegativeFlag,
    },
  ].reduce((acc, curr) => {
    return curr.set(curr.verify ? 1 : 0, acc);
  }, nes);

  return {
    nes: newNes,
    totalCycle: calculateCycles(cycles),
  };
};
const CMP = (instruction: InstructionData): InstructionReturn => {
  return compare(instruction.nes.cpu.ACC, instruction);
};
const CPX = (instruction: InstructionData): InstructionReturn => {
  return compare(instruction.nes.cpu.X, instruction);
};
const CPY = (instruction: InstructionData): InstructionReturn => {
  return compare(instruction.nes.cpu.Y, instruction);
};

const DEC = (instruction: InstructionData): InstructionReturn => {
  const { nes, addr, baseCycles } = instruction;

  if (addr === undefined) throw new Error("instruction DEC needs addr");

  const result = (readBus(addr, nes) - 1) & MASK_8;
  let _nes = writeBus(addr, result, nes);
  _nes = flagBuilder({ result }, _nes, [ZERO, NEGATIVE]);

  return {
    nes: _nes,
    totalCycle: baseCycles,
  };
};

const operate = (
  operation: "increment" | "decrement",
  get: (nes: Nes) => number,
  set: (value: number, nes: Nes) => Nes,
  { nes, baseCycles }: InstructionData
): InstructionReturn => {
  const operator = operation === "increment" ? 1 : -1;

  const result = (get(nes) + operator) & MASK_8;

  let _nes: Nes = set(result, nes);
  _nes = flagBuilder({ result }, _nes, [ZERO, NEGATIVE]);

  return {
    nes: _nes,
    totalCycle: baseCycles,
  };
};

const decrement = (
  get: (nes: Nes) => number,
  set: (value: number, nes: Nes) => Nes,
  instruction: InstructionData
): InstructionReturn => operate("decrement", get, set, instruction);

const increment = (
  get: (nes: Nes) => number,
  set: (value: number, nes: Nes) => Nes,
  instruction: InstructionData
): InstructionReturn => operate("increment", get, set, instruction);

const DEX = (instruction: InstructionData): InstructionReturn =>
  decrement(getX, setX, instruction);
const DEY = (instruction: InstructionData): InstructionReturn =>
  decrement(getY, setY, instruction);
const EOR = ({ data, nes, ...cycles }: InstructionData): InstructionReturn => {
  const result = data ^ nes.cpu.ACC;

  const _nes = flagBuilder({ result }, nes, [ZERO, NEGATIVE]);

  return {
    nes: setACC(result, _nes),
    totalCycle: calculateCycles(cycles),
  };
};
const INC = (instruction: InstructionData): InstructionReturn => {
  const { nes, addr, baseCycles } = instruction;

  if (addr === undefined) throw new Error("instruction INC must have addr");

  const result = (readBus(addr, nes) + 1) & MASK_8;
  let _nes = writeBus(addr, result, nes);
  _nes = flagBuilder({ result }, _nes, [ZERO, NEGATIVE]);

  return {
    nes: _nes,
    totalCycle: baseCycles,
  };
};

const INX = (instruction: InstructionData): InstructionReturn =>
  increment(getX, setX, instruction);

const INY = (instruction: InstructionData): InstructionReturn =>
  increment(getY, setY, instruction);

const JMP = ({
  baseCycles,
  nes,
  data,
}: InstructionData): InstructionReturn => ({
  totalCycle: baseCycles,
  nes: setPC(data, nes),
});
const JSR = ({ nes, baseCycles, data }: InstructionData): InstructionReturn => {
  let _nes = pushToStack(nes, nes.cpu.PC - 1);

  return {
    totalCycle: baseCycles,
    nes: setPC(data, _nes),
  };
};

const load = (
  set: (result: number, nes: Nes) => Nes,
  { nes, data: result, ...cycles }: InstructionData
): InstructionReturn => {
  const _nes = flagBuilder({ result }, nes, [ZERO, NEGATIVE]);

  return {
    nes: set(result, _nes),
    totalCycle: calculateCycles(cycles),
  };
};

const LDA = (instruction: InstructionData): InstructionReturn =>
  load(setACC, instruction);

const LDX = (instruction: InstructionData): InstructionReturn =>
  load(setX, instruction);

const LDY = (instruction: InstructionData): InstructionReturn =>
  load(setY, instruction);

const LSR_RESULT = (data: number, nes: Nes): [result: number, nes: Nes] => {
  const result = data >> 1;

  const _nes = flagBuilder({ result, data }, nes, [CARRY_SHIFT_RIGHT, ZERO]);

  return [result, _nes];
};

const LSR_ACC = ({
  data,
  nes,
  baseCycles,
}: InstructionData): InstructionReturn => {
  const [result, _nes] = LSR_RESULT(data, nes);

  return {
    nes: setACC(result, _nes),
    totalCycle: baseCycles,
  };
};

const LSR_MEMORY = ({
  data,
  nes,
  baseCycles,
  addr,
}: InstructionData): InstructionReturn => {
  if (addr === undefined) throw new Error("addr can't be undefined on LSR");

  const [result, _nes] = LSR_RESULT(data, nes);

  return {
    nes: writeBus(addr, result, _nes),
    totalCycle: baseCycles,
  };
};

const LSR = (instruction: InstructionData): InstructionReturn => {
  if (instruction.acc) {
    return LSR_ACC(instruction);
  } else {
    return LSR_MEMORY(instruction);
  }
};
const NOP = ({ nes, baseCycles }: InstructionData): InstructionReturn => ({
  nes,
  totalCycle: baseCycles,
});

const ORA = ({ nes, data, ...cycles }: InstructionData): InstructionReturn => {
  const result = getACC(nes) | data;

  let _nes = flagBuilder({ result }, nes, [ZERO, NEGATIVE]);

  return {
    nes: setACC(result, _nes),
    totalCycle: calculateCycles(cycles),
  };
};
const PHA = ({ nes, baseCycles }: InstructionData): InstructionReturn => {
  const ACC = getACC(nes);
  let _nes = pushToStack(nes, ACC);
  return {
    nes: _nes,
    totalCycle: baseCycles,
  };
};
const PHP = ({ nes, baseCycles }: InstructionData): InstructionReturn => {
  const STATUS = getSTATUS(nes);
  let _nes = pushToStack(nes, STATUS);
  return {
    nes: _nes,
    totalCycle: baseCycles,
  };
};
const PLA = ({ nes, baseCycles }: InstructionData): InstructionReturn => {
  let [result, _nes] = pullFromStack(nes);

  _nes = flagBuilder({ result }, _nes, [ZERO, NEGATIVE]);

  return {
    nes: setACC(result, _nes),
    totalCycle: baseCycles,
  };
};
const PLP = ({ nes, baseCycles }: InstructionData): InstructionReturn => {
  const [STATUS, _nes] = pullFromStack(nes);
  return {
    nes: setSTATUS(STATUS, _nes),
    totalCycle: baseCycles,
  };
};

const ROL_RESULT = (data: number, nes: Nes): [result: number, nes: Nes] => {
  const CARRY_BIT = data >> 7;

  const result = (data << 1) | CARRY_BIT;

  const _nes = flagBuilder({ result }, nes, [CARRY, ZERO, NEGATIVE]);

  return [result & MASK_8, _nes];
};

const ROL_ACC = ({
  data,
  nes,
  baseCycles,
}: InstructionData): InstructionReturn => {
  const [result, _nes] = ROL_RESULT(data, nes);

  return {
    nes: setACC(MASK_8 & result, _nes),
    totalCycle: baseCycles,
  };
};

const ROL_MEMORY = ({
  data,
  nes,
  baseCycles,
  addr,
}: InstructionData): InstructionReturn => {
  if (addr === undefined) throw new Error("ROL must have addr.");

  const [result, _nes] = ROL_RESULT(data, nes);

  return {
    nes: writeBus(addr, result, _nes),
    totalCycle: baseCycles,
  };
};

const ROL = (instruction: InstructionData): InstructionReturn => {
  const { acc } = instruction;

  if (acc) {
    return ROL_ACC(instruction);
  } else {
    return ROL_MEMORY(instruction);
  }
};
const POR = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const RTI = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const RTS = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const SBC = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const SEC = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};

const SED = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const SEI = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const STA = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const STX = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const STY = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const TAX = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const TAY = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const TSX = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const TXA = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const TXS = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const TYA = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
export {
  ADC,
  AND,
  ASL,
  BCC,
  BCS,
  BEQ,
  BIT,
  BMI,
  BNE,
  BPL,
  BRK,
  BVC,
  BVS,
  CLC,
  CLD,
  CLI,
  CLV,
  CMP,
  CPX,
  CPY,
  DEC,
  DEX,
  DEY,
  EOR,
  INC,
  INX,
  INY,
  JMP,
  JSR,
  LDA,
  LDX,
  LDY,
  LSR,
  NOP,
  ORA,
  PHA,
  PHP,
  PLA,
  PLP,
  ROL,
  POR,
  RTI,
  RTS,
  SBC,
  SEC,
  SED,
  SEI,
  STA,
  STX,
  STY,
  TAX,
  TAY,
  TSX,
  TXA,
  TXS,
  TYA,
};

export type { InstructionData };
