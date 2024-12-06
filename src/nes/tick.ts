import { readBusNes } from "./bus/bus";
import { getPC } from "./cpu/cpu";
import { getInstructions } from "./cpu/intructionDictionary/instructionDictionary";
import { Nes } from "./nes";

export const FREQUENCY = 1.66 * Math.pow(10, 6);
export const PERIOD = 1 / FREQUENCY;
export const PERIOD_MILI = PERIOD * 1000;

export const tick = (nes: Nes) => {
  const PC = getPC(nes);
  const [opcode, _nes] = readBusNes(PC, nes);
  const { addr, instruction } = getInstructions(opcode);
  return instruction(addr(_nes));
};
