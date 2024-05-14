import { Control } from "@/hooks/control/control";
import { writeBusNes } from "@/nes/bus/bus";
import { Nes } from "@/nes/nes";

const ADDR_PAD_ONE = 0x4016;
const ADDR_PAD_TWO = 0x4017;

const writeControl = (nes: Nes, addr: number, control: Control) => {
  const { a, b, down, left, right, select, start, up } = control;
  const controlArr = [a, b, select, start, up, down, left, right];
  const data = controlArr.reduce(
    (acc, curr, i) => (curr ? acc | (1 << i) : acc),
    0
  );
  return writeBusNes(addr, data, nes);
};

export const writePadOne = (nes: Nes, control: Control) => {
  return writeControl(nes, ADDR_PAD_ONE, control);
};

export const writePadTwo = (nes: Nes, control: Control) => {
  return writeControl(nes, ADDR_PAD_TWO, control);
};
