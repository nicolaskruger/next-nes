import { Nes } from "@/nes/nes";
import {
  getCarryFlag,
  setCarryFlag,
  setNegativeFlag,
  setOverFlowFlag,
  setZeroFlag,
} from "../cpu";
import { Result } from "postcss";
import { MASK_8 } from "@/nes/helper/mask";

type InstructionData = {
  nes: Nes;
  data: number;
  baseCycles: number;
  cross: boolean;
  offsetOnCross: number;
  offsetOnBranchSucceed: number;
};

type InstructionReturn = {
  nes: Nes;
  totalCycle: number;
};

const verifyIfCarryBit = (result: number) => {
  return (result & 0x100) >> 8;
};

const verifyIfZero = (result: number) => ((result & 0xff) === 0 ? 1 : 0);

const isOverFlow = (result: number, a: number, b: number) =>
  (is8bitsNegative(result) && is8bitsPositive(a) && is8bitsPositive(b)) ||
  (is8bitsPositive(result) && is8bitsNegative(a) && is8bitsNegative(b));

const is8bitsNegative = (value: number) => ((value >> 7) & 1) === 1;
const is8bitsPositive = (value: number) => !is8bitsNegative(value);

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

export { ADC };
