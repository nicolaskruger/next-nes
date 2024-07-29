import { readBusNes } from "./bus/bus";
import { getCycles, getPC } from "./cpu/cpu";
import {
  getInstructions,
  instructionDictionary,
} from "./cpu/intructionDictionary/instructionDictionary";
import { dexToHex } from "./helper/converter";
import { Nes } from "./nes";
import { vBlack } from "./ppu/v-blank/v-blank";
import { pushTrack } from "./track/track";

export const FREQUENCY = 1.66 * Math.pow(10, 6);
export const PERIOD = 1 / FREQUENCY;
export const PERIOD_MILI = PERIOD * 1000;

let lastInstruction: string;
let oldPc: number;

export const tick = (nes: Nes) => {
  const start = performance.now();
  const PC = getPC(nes);
  if (PC < 0x8000) {
    console.log(lastInstruction, oldPc.toString(16));
    throw Error(
      `not allowed addr: ${dexToHex(oldPc, 4, true)} ints: ${lastInstruction} `
    );
  }
  oldPc = PC;
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
  const finish = performance.now();
  let cycles = getCycles(_nes);

  const executeTime = finish - start;
  const totalTime = PERIOD_MILI * cycles;
  const delayTime = totalTime - executeTime;

  _nes = vBlack(_nes);
  return { nes: _nes, executeTime, totalTime, delayTime, cycles };
};
