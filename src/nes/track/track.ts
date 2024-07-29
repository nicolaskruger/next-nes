import { getPC } from "../cpu/cpu";
import { InstructionDictionary } from "../cpu/intructionDictionary/instructionDictionary";
import { Nes } from "../nes";

export type Track = string[];

const size = 100;

const initTrack = (): Track => [];

const getTrack = (nes: Nes) => nes.track;

const setTrack = (nes: Nes, track: Track) => {
  nes.track = track;
  return nes;
};

export const pushTrack = (
  nes: Nes,
  { instruction, addr }: InstructionDictionary
): Nes => {
  const info = `${getPC(nes).toString(16)}: ${instruction.name} ${addr.name}`;

  let track = getTrack(nes);

  if (track === undefined) {
    nes = setTrack(nes, []);
  }
  track = getTrack(nes)!;
  setTrack(nes, [info, ...track].slice(0, 100));

  return nes;
};
