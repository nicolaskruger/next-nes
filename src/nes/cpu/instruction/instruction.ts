import { Nes } from "@/nes/nes";
import {
  CARRY,
  NEGATIVE,
  OVERFLOW,
  ZERO,
  flagBuilder,
  getCarryFlag,
  getNegativeFlag,
  getOverFlowFlag,
  getZeroFlag,
  setBreakCommand,
  setCarryFlag,
  setDecimalMode,
  setInterruptDisable,
  setNegativeFlag,
  setOverFlowFlag,
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
};

type InstructionReturn = {
  nes: Nes;
  totalCycle: number;
};

type CalculateCycles = Pick<
  InstructionData,
  "baseCycles" | "cross" | "offsetOnCross"
>;

const verifyIfCarryBit = (result: number) => {
  return (result & 0x100) >> 8;
};

const verifyIfZero = (result: number) => ((result & 0xff) === 0 ? 1 : 0);

const verifyNegative = (result: number) => (is8bitsNegative(result) ? 1 : 0);

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
    nes: {
      ..._nes,
      cpu: {
        ..._nes.cpu,
        ACC: result & MASK_8,
      },
    },
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
    nes: {
      ..._nes,
      cpu: {
        ..._nes.cpu,
        ACC: result,
      },
    },
  };
};

const ACL = ({ data, nes, ...cycles }: InstructionData): InstructionReturn => {
  const result = data << 1;

  const _nes = flagBuilder({ result }, nes, [CARRY, ZERO, NEGATIVE]);

  const totalCycle = calculateCycles({ ...cycles });

  return {
    nes: { ..._nes, cpu: { ..._nes.cpu, ACC: result & MASK_8 } },
    totalCycle,
  };
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
    nes: {
      ...nes,
      cpu: {
        ...cpu,
        PC,
      },
    },
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
  return {
    ...newNes,
    cpu: {
      ...newNes.cpu,
      STK,
    },
  };
};

const BRK = ({ nes, baseCycles }: InstructionData): InstructionReturn => {
  let newNes = [nes.cpu.PC, nes.cpu.STATUS].reduce(
    (acc, curr) => pushToStack(acc, curr),
    nes
  );

  newNes = setBreakCommand(1, newNes);

  const { cpu } = newNes;

  return {
    totalCycle: baseCycles,
    nes: {
      ...newNes,
      cpu: {
        ...cpu,
        PC: 0xfffe,
      },
    },
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
  { data, nes, baseCycles, cross, offsetOnCross }: InstructionData
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
    totalCycle: baseCycles + (cross ? offsetOnCross : 0),
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
  const { nes, data: addr, baseCycles } = instruction;

  const result = (readBus(addr, nes) - 1) & MASK_8;
  let _nes = writeBus(addr, result, nes);
  _nes = flagBuilder({ result }, _nes, [ZERO, NEGATIVE]);

  return {
    nes: _nes,
    totalCycle: baseCycles,
  };
};
const DEX = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const DEY = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const EOR = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const INC = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const INX = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const INY = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const JMP = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const JSR = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const LDA = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const LDX = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const LDY = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const LSR = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const NOP = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};

const ORA = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const PHA = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const PHP = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const PLA = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const PLP = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
};
const ROL = (instruction: InstructionData): InstructionReturn => {
  throw new Error("not implemented");
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
  ACL,
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
