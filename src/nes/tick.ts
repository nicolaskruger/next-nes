import { readBusNes } from "./bus/bus";
import { getCycles, getPC } from "./cpu/cpu";
import { instructionDictionary } from "./cpu/intructionDictionary/instructionDictionary";
import { Nes, nesBuilder } from "./nes";

export const tick = (nes: Nes): Nes => {
  let cycles = getCycles(nes);
  if (cycles) return nesBuilder(nes).cycles(--cycles).build();
  const PC = getPC(nes);
  const [fetch, nesFetch] = readBusNes(PC, nes);
  let _nes = nesFetch;
  const { addr, instruction, baseCycles, offsetCycles } =
    instructionDictionary[fetch];
  const addrResult = addr(nes);
  _nes = instruction({
    baseCycles,
    ...addrResult,
    offsetOnCross: offsetCycles,
  });
  return _nes;
};
