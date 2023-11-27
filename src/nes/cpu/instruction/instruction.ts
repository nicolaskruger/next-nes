import { Nes, nesBuilder } from "@/nes/nes";
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

type Instruction = {
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
  Instruction,
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
}: Instruction): Nes => {
  const { cpu } = nes;
  const CARRY_FLAG = getCarryFlag(nes);
  const { ACC } = cpu;
  const result = data + CARRY_FLAG + ACC;

  const totalCycle = baseCycles + (cross ? offsetOnCross : 0);

  let _nes = flagBuilder({ result, a: data, b: ACC }, nes, [
    CARRY,
    ZERO,
    OVERFLOW,
    NEGATIVE,
  ]);

  return nesBuilder(_nes)
    .ACC(result & MASK_8)
    .cycles(totalCycle)
    .build();
};

const AND = ({
  nes,
  data,
  baseCycles,
  cross,
  offsetOnCross,
}: Instruction): Nes => {
  const { cpu } = nes;
  const { ACC } = cpu;

  const result = ACC & data;

  const _nes = flagBuilder({ result }, nes, [ZERO, NEGATIVE]);

  const totalCycle = calculateCycles({ baseCycles, cross, offsetOnCross });

  return nesBuilder(_nes).cycles(totalCycle).ACC(result).build();
};

const ASL_RESULT_CYCLES = (
  data: number,
  cycles: CalculateCycles,
  nes: Nes
): [result: number, totalCycles: number, nes: Nes] => {
  const result = data << 1;

  const _nes = flagBuilder({ result }, nes, [CARRY, ZERO, NEGATIVE]);

  const totalCycle = calculateCycles({ ...cycles });

  return [result & MASK_8, totalCycle, _nes];
};

const ASL_ACC = ({ data, nes, ...cycles }: Instruction): Nes => {
  const [result, totalCycle, _nes] = ASL_RESULT_CYCLES(data, cycles, nes);

  return nesBuilder(_nes).ACC(result).cycles(totalCycle).build();
};

const ASL_MEMORY = ({ data, nes, addr, ...cycles }: Instruction): Nes => {
  if (addr === undefined)
    throw new Error("this instruction needs memory addr.");

  const [result, totalCycle, _nes] = ASL_RESULT_CYCLES(data, cycles, nes);

  return nesBuilder(_nes).buss(addr, result).cycles(totalCycle).build();
};

const ASL = (instruction: Instruction): Nes => {
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
  { nes, data, baseCycles }: Instruction
): Nes => {
  const flag = getFlag(nes);

  if (verify(flag)) {
    return nesBuilder(nes).cycles(baseCycles).build();
  }

  let extraCycles = 1;

  const { cpu } = nes;

  const PC = cpu.PC + data;

  if (PC >> 8 !== cpu.PC >> 8) extraCycles += 2;

  return nesBuilder(nes)
    .PC(PC)
    .cycles(baseCycles + extraCycles)
    .build();
};

const clearFlag = (value: number) => !!value;
const setFlag = (value: number) => !value;

const BCC = (instruction: Instruction): Nes => {
  return branch(getCarryFlag, clearFlag, instruction);
};

const BCS = (instruction: Instruction): Nes => {
  return branch(getCarryFlag, setFlag, instruction);
};

const BEQ = (instruction: Instruction): Nes => {
  return branch(getZeroFlag, setFlag, instruction);
};

const BIT = ({ nes, data, baseCycles }: Instruction): Nes => {
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

  return nesBuilder(_nes).cycles(baseCycles).build();
};

const BMI = (instruction: Instruction): Nes => {
  return branch(getNegativeFlag, setFlag, instruction);
};

const BNE = (instruction: Instruction): Nes => {
  return branch(getZeroFlag, clearFlag, instruction);
};

const BPL = (instruction: Instruction): Nes => {
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

const BRK = ({ nes, baseCycles }: Instruction): Nes => {
  let _nes = [nes.cpu.PC, nes.cpu.STATUS].reduce(
    (acc, curr) => pushToStack(acc, curr),
    nes
  );

  _nes = setBreakCommand(1, _nes);

  return nesBuilder(_nes).PC(0xfffe).cycles(baseCycles).build();
};

const BVC = (instruction: Instruction): Nes => {
  return branch(getOverFlowFlag, clearFlag, instruction);
};

const BVS = (instruction: Instruction): Nes => {
  return branch(getOverFlowFlag, setFlag, instruction);
};

const CLC = ({ nes, baseCycles }: Instruction): Nes =>
  nesBuilder(nes).carryFlag(0).cycles(baseCycles).build();

const CLD = ({ nes, baseCycles }: Instruction): Nes =>
  nesBuilder(nes).decimalMode(0).cycles(baseCycles).build();

const CLI = ({ nes, baseCycles }: Instruction): Nes =>
  nesBuilder(nes).interruptDisable(0).cycles(baseCycles).build();

const CLV = ({ nes, baseCycles }: Instruction): Nes =>
  nesBuilder(nes).overFlow(0).cycles(baseCycles).build();

const compare = (value: number, { data, nes, ...cycles }: Instruction): Nes => {
  const signedValue = make8bitSigned(value);
  const signedData = make8bitSigned(data);

  const _nes = [
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

  const totalCycle = calculateCycles(cycles);

  return nesBuilder(_nes).cycles(totalCycle).build();
};
const CMP = (instruction: Instruction): Nes => {
  return compare(instruction.nes.cpu.ACC, instruction);
};
const CPX = (instruction: Instruction): Nes => {
  return compare(instruction.nes.cpu.X, instruction);
};
const CPY = (instruction: Instruction): Nes => {
  return compare(instruction.nes.cpu.Y, instruction);
};

const DEC = (instruction: Instruction): Nes => {
  const { nes, addr, baseCycles } = instruction;

  if (addr === undefined) throw new Error("instruction DEC needs addr");

  const result = (readBus(addr, nes) - 1) & MASK_8;
  let _nes = writeBus(addr, result, nes);
  _nes = flagBuilder({ result }, _nes, [ZERO, NEGATIVE]);

  return nesBuilder(_nes).cycles(baseCycles).build();
};

const operate = (
  operation: "increment" | "decrement",
  get: (nes: Nes) => number,
  set: (value: number, nes: Nes) => Nes,
  { nes, baseCycles }: Instruction
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
  instruction: Instruction
): InstructionReturn => operate("decrement", get, set, instruction);

const increment = (
  get: (nes: Nes) => number,
  set: (value: number, nes: Nes) => Nes,
  instruction: Instruction
): InstructionReturn => operate("increment", get, set, instruction);

const DEX = (instruction: Instruction): InstructionReturn =>
  decrement(getX, setX, instruction);
const DEY = (instruction: Instruction): InstructionReturn =>
  decrement(getY, setY, instruction);
const EOR = ({ data, nes, ...cycles }: Instruction): InstructionReturn => {
  const result = data ^ nes.cpu.ACC;

  const _nes = flagBuilder({ result }, nes, [ZERO, NEGATIVE]);

  return {
    nes: setACC(result, _nes),
    totalCycle: calculateCycles(cycles),
  };
};
const INC = (instruction: Instruction): InstructionReturn => {
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

const INX = (instruction: Instruction): InstructionReturn =>
  increment(getX, setX, instruction);

const INY = (instruction: Instruction): InstructionReturn =>
  increment(getY, setY, instruction);

const JMP = ({ baseCycles, nes, data }: Instruction): InstructionReturn => ({
  totalCycle: baseCycles,
  nes: setPC(data, nes),
});
const JSR = ({ nes, baseCycles, data }: Instruction): InstructionReturn => {
  let _nes = pushToStack(nes, nes.cpu.PC - 1);

  return {
    totalCycle: baseCycles,
    nes: setPC(data, _nes),
  };
};

const load = (
  set: (result: number, nes: Nes) => Nes,
  { nes, data: result, ...cycles }: Instruction
): InstructionReturn => {
  const _nes = flagBuilder({ result }, nes, [ZERO, NEGATIVE]);

  return {
    nes: set(result, _nes),
    totalCycle: calculateCycles(cycles),
  };
};

const LDA = (instruction: Instruction): InstructionReturn =>
  load(setACC, instruction);

const LDX = (instruction: Instruction): InstructionReturn =>
  load(setX, instruction);

const LDY = (instruction: Instruction): InstructionReturn =>
  load(setY, instruction);

const LSR_RESULT = (data: number, nes: Nes): [result: number, nes: Nes] => {
  const result = data >> 1;

  const _nes = flagBuilder({ result, data }, nes, [CARRY_SHIFT_RIGHT, ZERO]);

  return [result, _nes];
};

const LSR_ACC = ({ data, nes, baseCycles }: Instruction): InstructionReturn => {
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
}: Instruction): InstructionReturn => {
  if (addr === undefined) throw new Error("addr can't be undefined on LSR");

  const [result, _nes] = LSR_RESULT(data, nes);

  return {
    nes: writeBus(addr, result, _nes),
    totalCycle: baseCycles,
  };
};

const LSR = (instruction: Instruction): InstructionReturn => {
  if (instruction.acc) {
    return LSR_ACC(instruction);
  } else {
    return LSR_MEMORY(instruction);
  }
};
const NOP = ({ nes, baseCycles }: Instruction): InstructionReturn => ({
  nes,
  totalCycle: baseCycles,
});

const ORA = ({ nes, data, ...cycles }: Instruction): InstructionReturn => {
  const result = getACC(nes) | data;

  let _nes = flagBuilder({ result }, nes, [ZERO, NEGATIVE]);

  return {
    nes: setACC(result, _nes),
    totalCycle: calculateCycles(cycles),
  };
};
const PHA = ({ nes, baseCycles }: Instruction): InstructionReturn => {
  const ACC = getACC(nes);
  let _nes = pushToStack(nes, ACC);
  return {
    nes: _nes,
    totalCycle: baseCycles,
  };
};
const PHP = ({ nes, baseCycles }: Instruction): InstructionReturn => {
  const STATUS = getSTATUS(nes);
  let _nes = pushToStack(nes, STATUS);
  return {
    nes: _nes,
    totalCycle: baseCycles,
  };
};
const PLA = ({ nes, baseCycles }: Instruction): InstructionReturn => {
  let [result, _nes] = pullFromStack(nes);

  _nes = flagBuilder({ result }, _nes, [ZERO, NEGATIVE]);

  return {
    nes: setACC(result, _nes),
    totalCycle: baseCycles,
  };
};
const PLP = ({ nes, baseCycles }: Instruction): InstructionReturn => {
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

const ROL_ACC = ({ data, nes, baseCycles }: Instruction): InstructionReturn => {
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
}: Instruction): InstructionReturn => {
  if (addr === undefined) throw new Error("ROL must have addr.");

  const [result, _nes] = ROL_RESULT(data, nes);

  return {
    nes: writeBus(addr, result, _nes),
    totalCycle: baseCycles,
  };
};

const ROL = (instruction: Instruction): InstructionReturn => {
  const { acc } = instruction;

  if (acc) {
    return ROL_ACC(instruction);
  } else {
    return ROL_MEMORY(instruction);
  }
};

const ROR_RESULT = (data: number, nes: Nes): [result: number, _nes: Nes] => {
  const CARRY_BIT = data & 1;

  const result = (CARRY_BIT << 7) | (data >> 1);

  const _nes = flagBuilder({ result, data }, nes, [
    CARRY_SHIFT_RIGHT,
    ZERO,
    NEGATIVE,
  ]);

  return [result, _nes];
};

const ROR_ACC = ({ data, nes, baseCycles }: Instruction): InstructionReturn => {
  const [result, _nes] = ROR_RESULT(data, nes);

  return {
    nes: setACC(result, _nes),
    totalCycle: baseCycles,
  };
};

const ROR_MEMORY = ({
  data,
  nes,
  baseCycles,
  addr,
}: Instruction): InstructionReturn => {
  if (addr === undefined) throw new Error("ROR memory need a addr");

  const [result, _nes] = ROL_RESULT(data, nes);

  return {
    nes: writeBus(addr, result, _nes),
    totalCycle: baseCycles,
  };
};

const ROR = ({ acc, ...instruction }: Instruction): InstructionReturn => {
  if (acc) return ROR_ACC(instruction);
  else return ROR_MEMORY(instruction);
};
const RTI = (instruction: Instruction): InstructionReturn => {
  throw new Error("not implemented");
};
const RTS = (instruction: Instruction): InstructionReturn => {
  throw new Error("not implemented");
};
const SBC = (instruction: Instruction): InstructionReturn => {
  throw new Error("not implemented");
};
const SEC = (instruction: Instruction): InstructionReturn => {
  throw new Error("not implemented");
};

const SED = (instruction: Instruction): InstructionReturn => {
  throw new Error("not implemented");
};
const SEI = (instruction: Instruction): InstructionReturn => {
  throw new Error("not implemented");
};
const STA = (instruction: Instruction): InstructionReturn => {
  throw new Error("not implemented");
};
const STX = (instruction: Instruction): InstructionReturn => {
  throw new Error("not implemented");
};
const STY = (instruction: Instruction): InstructionReturn => {
  throw new Error("not implemented");
};
const TAX = (instruction: Instruction): InstructionReturn => {
  throw new Error("not implemented");
};
const TAY = (instruction: Instruction): InstructionReturn => {
  throw new Error("not implemented");
};
const TSX = (instruction: Instruction): InstructionReturn => {
  throw new Error("not implemented");
};
const TXA = (instruction: Instruction): InstructionReturn => {
  throw new Error("not implemented");
};
const TXS = (instruction: Instruction): InstructionReturn => {
  throw new Error("not implemented");
};
const TYA = (instruction: Instruction): InstructionReturn => {
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
  ROR,
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

export type { Instruction as InstructionData };
