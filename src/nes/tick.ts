import { readBusNes } from "./bus/bus";
import { getPC } from "./cpu/cpu";
import { getInstructions } from "./cpu/intructionDictionary/instructionDictionary";
import { Nes } from "./nes";
import { pushTrack } from "./track/track";

export const FREQUENCY = 1.66 * Math.pow(10, 6);
export const PERIOD = 1 / FREQUENCY;
export const PERIOD_MILI = PERIOD * 1000;

let lastInstruction: string;

export const tick = (nes: Nes) => {
  const PC = getPC(nes);
  const [fetch, nesFetch] = readBusNes(PC, nes);
  let _nes = nesFetch;
  const inst = getInstructions(fetch);
  const { addr, instruction, baseCycles, offsetCycles } = inst;
  pushTrack(nes, inst);
  lastInstruction = instruction.name;
  const addrResult = addr(nes);
  _nes = instruction({
    baseCycles,
    ...addrResult,
    offsetOnCross: offsetCycles,
  });

  return _nes;
};
