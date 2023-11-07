import { Nes } from "@/nes/nes";
import {
  getCarryFlag,
  setCarryFlag,
  setNegativeFlag,
  setOverFlowFlag,
  setZeroFlag,
} from "../cpu";
import { MASK_8 } from "@/nes/helper/mask";

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

const isOverFlow = (result: number, a: number, b: number) =>
  (is8bitsNegative(result) && is8bitsPositive(a) && is8bitsPositive(b)) ||
  (is8bitsPositive(result) && is8bitsNegative(a) && is8bitsNegative(b));

const is8bitsNegative = (value: number) => ((value >> 7) & 1) === 1;
const is8bitsPositive = (value: number) => !is8bitsNegative(value);

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
  let CARRY = getCarryFlag(nes);
  const { ACC } = cpu;
  const result = data + CARRY + ACC;

  CARRY = verifyIfCarryBit(result);
  const ZERO = verifyIfZero(result);
  const OVERFLOW = isOverFlow(result, data, ACC) ? 1 : 0;
  const NEGATIVE = is8bitsNegative(result) ? 1 : 0;

  const totalCycle = baseCycles + (cross ? offsetOnCross : 0);

  let newNes = setCarryFlag(CARRY, nes);
  newNes = setZeroFlag(ZERO, newNes);
  newNes = setOverFlowFlag(OVERFLOW, newNes);
  newNes = setNegativeFlag(NEGATIVE, newNes);

  return {
    totalCycle,
    nes: {
      ...newNes,
      cpu: {
        ...newNes.cpu,
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

  const ZERO = verifyIfZero(result);
  const NEGATIVE = verifyNegative(result);

  let newNes = setZeroFlag(ZERO, nes);
  newNes = setNegativeFlag(NEGATIVE, newNes);

  const totalCycle = calculateCycles({ baseCycles, cross, offsetOnCross });

  return {
    totalCycle,
    nes: {
      ...newNes,
      cpu: {
        ...newNes.cpu,
        ACC: result,
      },
    },
  };
};

const ACL = ({ data, nes, ...cycles }: InstructionData): InstructionReturn => {
  const result = data << 1;

  const CARRY = verifyIfCarryBit(result);
  const ZERO = verifyIfZero(result);
  const NEGATIVE = verifyNegative(result & MASK_8);

  const newNes = [
    {
      set: setCarryFlag,
      flag: CARRY,
    },
    {
      set: setZeroFlag,
      flag: ZERO,
    },
    {
      set: setNegativeFlag,
      flag: NEGATIVE,
    },
  ].reduce((acc, curr) => {
    return curr.set(curr.flag, acc);
  }, nes);

  const totalCycle = calculateCycles({ ...cycles });

  return {
    nes: { ...newNes, cpu: { ...newNes.cpu, ACC: result & MASK_8 } },
    totalCycle,
  };
};

const BCC = ({ nes, data, baseCycles }: InstructionData): InstructionReturn => {
  const CARRY = getCarryFlag(nes);

  if (CARRY)
    return {
      nes,
      totalCycle: baseCycles,
    };

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

export { ADC, AND, ACL, BCC };
