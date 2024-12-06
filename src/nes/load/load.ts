import { readBusNes } from "../bus/bus";
import { getPC } from "../cpu/cpu";
import { getInstructions } from "../cpu/intructionDictionary/instructionDictionary";
import { Nes } from "../nes";
import { tick } from "../tick";

const LOAD_TIMEOUT = 3000;

const isLoopForever = (nes: Nes) => {
  const PC = getPC(nes);
  const [opcode] = readBusNes(PC, nes);
  const { instruction } = getInstructions(opcode);
  const [low] = readBusNes(PC + 1, nes);
  const [high] = readBusNes(PC + 2, nes);
  const addr = (high << 8) | low;
  return instruction.name === "JMP" && addr === PC;
};

export const load = (nes: Nes) => {
  const start = performance.now();
  while (!isLoopForever(nes)) {
    nes = tick(nes);
    if (performance.now() - start > LOAD_TIMEOUT) throw "exceed loading time";
  }
  return nes;
};
