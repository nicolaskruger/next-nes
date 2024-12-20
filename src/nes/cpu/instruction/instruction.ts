import { Nes, nesBuilder } from "@/nes/nes";
import {
  flagBuilder,
  getACC,
  getCarryFlag,
  getNMIFlag,
  getNegativeFlag,
  getOverFlowFlag,
  getPC,
  getSTATUS,
  getSTK,
  getX,
  getY,
  getZeroFlag,
  setACC,
  setCarryFlag,
  setNegativeFlag,
  setOverFlowFlag,
  setSTK,
  setX,
  setY,
  setZeroFlag,
} from "../cpu";
import { MASK_8 } from "@/nes/helper/mask";
import { readBusNes, writeBusNes } from "@/nes/bus/bus";
import { finishNMI, getNMIInfo, startNMI } from "../interrupt/interrupt";
import { repeat } from "@/nes/helper/repeat";

type Instruction = {
  nes: Nes;
  data: number;
  acc?: boolean;
  addr?: number;
};

const is8bitsNegative = (value: number) => ((value >> 7) & 1) === 1;

export const make8bitSigned = (value: number) => {
  if (is8bitsNegative(value)) return ~0xff | value;
  return value;
};

const minus8bitSigned = (value: number) => {
  return -make8bitSigned(value) & 0xff;
};

export const pushPCStack = (nes: Nes, pc: number): Nes => {
  const high = (pc >> 8) & 0xff;
  const low = pc & 0xff;
  return [high, low].reduce((acc, curr) => pushToStack(acc, curr), nes);
};

export const pullPCStack = (nes: Nes): [number, Nes] => {
  const [low, nesLow] = pullFromStack(nes);
  const [high, nesHigh] = pullFromStack(nesLow);
  return [(high << 8) | low, nesHigh];
};

const ADC = ({ data, nes }: Instruction): Nes => {
  const { cpu } = nes;
  const CARRY_FLAG = getCarryFlag(nes);
  const { ACC } = cpu;
  const result = data + CARRY_FLAG + ACC;

  return flagBuilder({ result, a: data, b: ACC }, nes)
    .carry()
    .zero()
    .overFlow()
    .negative()
    .nesBuilder()
    .ACC(result & MASK_8)
    .build();
};

const AND = ({ nes, data }: Instruction): Nes => {
  const { cpu } = nes;
  const { ACC } = cpu;

  const result = ACC & data;

  return flagBuilder({ result }, nes)
    .zero()
    .negative()
    .nesBuilder()
    .ACC(result)
    .build();
};

const ASL_RESULT_CYCLES = (data: number, nes: Nes) => {
  const result = data << 1;

  const _nes = flagBuilder({ result }, nes).carry().zero().negative().build();

  return [result & MASK_8, _nes] as const;
};

const ASL_ACC = ({ data, nes }: Instruction): Nes => {
  const [result, _nes] = ASL_RESULT_CYCLES(data, nes);

  return nesBuilder(_nes).ACC(result).build();
};

const ASL_MEMORY = ({ data, nes, addr }: Instruction): Nes => {
  if (addr === undefined)
    throw new Error("this instruction needs memory addr.");

  const [result, _nes] = ASL_RESULT_CYCLES(data, nes);

  return nesBuilder(_nes).buss(addr, result).build();
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
  { nes, data }: Instruction
): Nes => {
  const flag = getFlag(nes);

  if (verify(flag)) {
    return nes;
  }

  const { cpu } = nes;

  const PC = cpu.PC + data;

  return nesBuilder(nes).PC(PC).build();
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

const BIT = ({ nes, data }: Instruction): Nes => {
  const result = data & nes.cpu.ACC;

  return flagBuilder({ result }, nes)
    .customFlagBuilder({
      set: setCarryFlag,
      flag: ({ result }) => (result === 0 ? 1 : 0),
    })
    .customFlagBuilder({
      set: setOverFlowFlag,
      flag: ({ result }) => (data >> 6) & 1,
    })
    .customFlagBuilder({
      set: setNegativeFlag,
      flag: ({ result }) => (data >> 7) & 1,
    })
    .nesBuilder()
    .build();
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

export const pushToStack = (nes: Nes, data: number): Nes => {
  let STK = nes.cpu.STK;
  if (STK < 0) throw new Error("stack overflow");
  const newNes = writeBusNes(0x0100 | STK, data, nes);
  STK--;
  return setSTK(STK, newNes);
};

const pullFromStack = (nes: Nes): [value: number, nes: Nes] => {
  let STK = getSTK(nes);
  STK++;
  finishNMI(nes, STK);
  if (STK > 0xff) throw new Error("stack overflow");
  const [value, _nes] = readBusNes(0x0100 | STK, nes);
  return [value, setSTK(STK, _nes)];
};

const BRK = ({ nes }: Instruction): Nes => {
  return nesBuilder(nes)
    .pushPCStack(getPC(nes))
    .pushToStack(getSTATUS(nes))
    .setBreakCommand(1)
    .build();
};

const BVC = (instruction: Instruction): Nes => {
  return branch(getOverFlowFlag, clearFlag, instruction);
};

const BVS = (instruction: Instruction): Nes => {
  return branch(getOverFlowFlag, setFlag, instruction);
};

const CLC = ({ nes }: Instruction): Nes => nesBuilder(nes).carryFlag(0).build();

const CLD = ({ nes }: Instruction): Nes =>
  nesBuilder(nes).decimalMode(0).build();

const CLI = ({ nes }: Instruction): Nes =>
  nesBuilder(nes).interruptDisable(0).build();

const CLV = ({ nes }: Instruction): Nes => nesBuilder(nes).overFlow(0).build();

const compare = (value: number, { data, nes }: Instruction): Nes => {
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

  return nesBuilder(_nes).build();
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
  const { nes, addr } = instruction;

  if (addr === undefined) throw new Error("instruction DEC needs addr");

  const [data, _nes] = readBusNes(addr, nes);

  const result = (data - 1) & MASK_8;

  return flagBuilder({ result }, _nes)
    .zero()
    .negative()
    .nesBuilder()
    .buss(addr, result)
    .build();
};

const operate = (
  operation: "increment" | "decrement",
  get: (nes: Nes) => number,
  set: (value: number, nes: Nes) => Nes,
  { nes }: Instruction
): Nes => {
  const operator = operation === "increment" ? 1 : -1;

  const result = (get(nes) + operator) & MASK_8;

  const _nes: Nes = set(result, nes);
  return flagBuilder({ result }, _nes).zero().negative().nesBuilder().build();
};

const decrement = (
  get: (nes: Nes) => number,
  set: (value: number, nes: Nes) => Nes,
  instruction: Instruction
): Nes => operate("decrement", get, set, instruction);

const increment = (
  get: (nes: Nes) => number,
  set: (value: number, nes: Nes) => Nes,
  instruction: Instruction
): Nes => operate("increment", get, set, instruction);

const DEX = (instruction: Instruction): Nes =>
  decrement(getX, setX, instruction);

const DEY = (instruction: Instruction): Nes =>
  decrement(getY, setY, instruction);

const EOR = ({ data, nes }: Instruction): Nes => {
  const result = data ^ nes.cpu.ACC;

  return flagBuilder({ result }, nes)
    .zero()
    .negative()
    .nesBuilder()
    .ACC(result)
    .build();
};

const INC = (instruction: Instruction): Nes => {
  const { nes, addr } = instruction;

  if (addr === undefined) throw new Error("instruction INC must have addr");

  const [data, _nes] = readBusNes(addr, nes);

  const result = (data + 1) & MASK_8;

  return flagBuilder({ result }, _nes)
    .zero()
    .negative()
    .nesBuilder()
    .buss(addr, result)
    .build();
};

const INX = (instruction: Instruction): Nes =>
  increment(getX, setX, instruction);

const INY = (instruction: Instruction): Nes =>
  increment(getY, setY, instruction);

const JMP = ({ nes, addr }: Instruction): Nes =>
  nesBuilder(nes)
    .PC(addr as number)
    .build();

const JSR = ({ nes, addr }: Instruction): Nes =>
  nesBuilder(nes)
    .pushPCStack(nes.cpu.PC - 1)
    .PC(addr!)
    .build();

const load = (
  set: (result: number, nes: Nes) => Nes,
  { nes, data: result }: Instruction
): Nes =>
  flagBuilder({ result }, nes)
    .zero()
    .negative()
    .nesBuilder()
    .customSet(result, set)
    .build();

const LDA = (instruction: Instruction): Nes => load(setACC, instruction);

const LDX = (instruction: Instruction): Nes => load(setX, instruction);

const LDY = (instruction: Instruction): Nes => load(setY, instruction);

const LSR_RESULT = (data: number, nes: Nes): [result: number, nes: Nes] => {
  const result = data >> 1;

  const _nes = flagBuilder({ result, data }, nes)
    .carryShiftRight()
    .zero()
    .build();

  return [result, _nes];
};

const LSR_ACC = ({ data, nes }: Instruction): Nes => {
  const [result, _nes] = LSR_RESULT(data, nes);

  return nesBuilder(_nes).ACC(result).build();
};

const LSR_MEMORY = ({ data, nes, addr }: Instruction): Nes => {
  if (addr === undefined) throw new Error("addr can't be undefined on LSR");

  const [result, _nes] = LSR_RESULT(data, nes);

  return nesBuilder(_nes).buss(addr, result).build();
};

const LSR = (instruction: Instruction): Nes => {
  if (instruction.acc) {
    return LSR_ACC(instruction);
  } else {
    return LSR_MEMORY(instruction);
  }
};

const NOP = ({ nes }: Instruction): Nes => nes;

const ORA = ({ nes, data }: Instruction): Nes => {
  const result = getACC(nes) | data;

  return flagBuilder({ result }, nes)
    .zero()
    .negative()
    .nesBuilder()
    .ACC(result)
    .build();
};
const PHA = ({ nes }: Instruction): Nes => {
  const ACC = getACC(nes);

  return nesBuilder(nes).pushToStack(ACC).build();
};
const PHP = ({ nes }: Instruction): Nes => {
  const STATUS = getSTATUS(nes);
  return nesBuilder(nes).pushToStack(STATUS).build();
};
const PLA = ({ nes }: Instruction): Nes => {
  const [result, _nes] = pullFromStack(nes);

  return flagBuilder({ result }, _nes)
    .zero()
    .negative()
    .nesBuilder()
    .ACC(result)

    .build();
};
const PLP = ({ nes }: Instruction): Nes => {
  const [STATUS, _nes] = pullFromStack(nes);
  return nesBuilder(_nes).status(STATUS).build();
};

const ROL_RESULT = (data: number, nes: Nes): [result: number, nes: Nes] => {
  const CARRY_BIT = data >> 7;

  const result = (data << 1) | CARRY_BIT;

  const _nes = flagBuilder({ result }, nes).carry().zero().negative().build();

  return [result & MASK_8, _nes];
};

const ROL_ACC = ({ data, nes }: Instruction): Nes => {
  const [result, _nes] = ROL_RESULT(data, nes);

  return nesBuilder(_nes)
    .ACC(result & MASK_8)

    .build();
};

const ROL_MEMORY = ({ data, nes, addr }: Instruction): Nes => {
  if (addr === undefined) throw new Error("ROL must have addr.");

  const [result, _nes] = ROL_RESULT(data, nes);

  return nesBuilder(_nes).buss(addr, result).build();
};

const ROL = (instruction: Instruction): Nes => {
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

  const _nes = flagBuilder({ result, data }, nes)
    .carryShiftRight()
    .zero()
    .negative()
    .build();

  return [result, _nes];
};

const ROR_ACC = ({ data, nes }: Instruction): Nes => {
  const [result, _nes] = ROR_RESULT(data, nes);

  return nesBuilder(_nes).ACC(result).build();
};

const ROR_MEMORY = ({ data, nes, addr }: Instruction): Nes => {
  if (addr === undefined) throw new Error("ROR memory need a addr");

  const [result, _nes] = ROL_RESULT(data, nes);

  return nesBuilder(_nes).buss(addr, result).build();
};

const ROR = ({ acc, ...instruction }: Instruction): Nes => {
  if (acc) return ROR_ACC(instruction);
  else return ROR_MEMORY(instruction);
};
const RTI = ({ nes }: Instruction): Nes => {
  const [STATUS, nesStatus] = pullFromStack(nes);

  return nesBuilder(nesStatus)
    .pullPCStack()

    .status(STATUS)
    .build();
};
const RTS = ({ nes }: Instruction): Nes => {
  return nesBuilder(nes).pullPCStackNext().build();
};
const SBC = ({ data, nes }: Instruction): Nes => {
  const dataSigned = minus8bitSigned(data);
  const carrySigned = minus8bitSigned(~getCarryFlag(nes) & 1);
  const ACC = getACC(nes);
  const result = ACC + dataSigned + carrySigned;
  return flagBuilder({ result, a: ACC, b: dataSigned }, nes)
    .carrySubtract()
    .zero()
    .overFlow()
    .negative()
    .nesBuilder()
    .ACC(result & MASK_8)
    .build();
};
const SEC = ({ nes }: Instruction): Nes => nesBuilder(nes).carryFlag(1).build();

const SED = ({ nes }: Instruction): Nes =>
  nesBuilder(nes).decimalMode(1).build();

const SEI = ({ nes }: Instruction): Nes =>
  nesBuilder(nes).interruptDisable(1).build();

const STA = ({ addr, nes }: Instruction): Nes => {
  if (addr === undefined) throw new Error("addr must be defined for STA");
  return nesBuilder(nes).buss(addr, getACC(nes)).build();
};

const STX = ({ addr, nes }: Instruction): Nes => {
  if (addr === undefined) throw new Error("STX needs addr");
  return nesBuilder(nes).buss(addr, getX(nes)).build();
};

const STY = ({ addr, nes }: Instruction): Nes => {
  if (addr === undefined) throw new Error("STY needs addr");
  return nesBuilder(nes).buss(addr, getY(nes)).build();
};

const transferAccumulatorNumber = ({
  nes,
}: Instruction): [number, ReturnType<typeof nesBuilder>] => {
  const result = getACC(nes);
  const nesB = flagBuilder({ result }, nes).negative().zero().nesBuilder();
  return [result, nesB];
};

const TAX = (instruction: Instruction): Nes => {
  const [result, nesB] = transferAccumulatorNumber(instruction);
  return nesB.X(result).build();
};

const TAY = (instruction: Instruction): Nes => {
  const [result, nesB] = transferAccumulatorNumber(instruction);
  return nesB.Y(result).build();
};

const TSX = ({ nes }: Instruction): Nes => {
  const result = getSTK(nes);

  return flagBuilder({ result }, nes)
    .zero()
    .negative()
    .nesBuilder()
    .X(result)

    .build();
};

const transferNumberToAccumulator = (get: (nes: Nes) => number, nes: Nes) => {
  const result = get(nes);

  return flagBuilder({ result }, nes)
    .zero()
    .negative()
    .nesBuilder()
    .ACC(result)
    .build();
};

const TXA = ({ nes }: Instruction): Nes => {
  return transferNumberToAccumulator(getX, nes);
};
const TXS = ({ nes }: Instruction): Nes =>
  nesBuilder(nes).X(getSTK(nes)).build();
const TYA = ({ nes }: Instruction): Nes =>
  transferNumberToAccumulator(getY, nes);

export const XXX = ({ nes }: Instruction): Nes => nes;

const NMI = (nes: Nes): Nes => {
  const nmi = getNMIInfo(nes);
  let [active, nes00] = getNMIFlag(nes);
  if (!active || nmi.occur) return nes00;
  nes00 = startNMI(nes00);
  const [addr, nesAddr] = [0xfffa, 0xfffb].reduce(
    ([num, _nes], addr, i) => {
      const [nNum, nNes] = readBusNes(addr, _nes);
      return [(nNum << (8 * i)) | num, nNes] as [number, Nes];
    },
    [0, nes00] as [number, Nes]
  );
  return nesBuilder(nesAddr)
    .pushPCStack(getPC(nesAddr))
    .pushToStack(getSTATUS(nesAddr))
    .PC(addr)
    .build();
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
  NMI,
};

export type { Instruction };
