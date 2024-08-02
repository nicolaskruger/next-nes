import { Control } from "@/hooks/control/control";
import { Read, Write } from "../bus/bus";
import { Nes } from "../nes";

type Pad = Control & { index: number; write: number[] };
export type NesControl = {
  pad1: Pad;
};

const padVet: (keyof Pad)[] = [
  "a",
  "b",
  "select",
  "start",
  "up",
  "down",
  "left",
  "right",
];

export const initPad = (): Pad => ({
  a: false,
  b: false,
  down: false,
  index: 0,
  left: false,
  right: false,
  select: false,
  start: false,
  up: false,
  write: [],
});

export const initControl = (): NesControl => ({ pad1: initPad() });

const getPad1 = (nes: Nes) => nes.control.pad1;

export const updatePad1 = (pad1: Control, nes: Nes): Nes => {
  nes.control.pad1 = {
    ...getPad1(nes),
    ...pad1,
  };

  return nes;
};

export const readPad1: Read = (_, nes) => {
  const data = getPad1(nes)[padVet[getPad1(nes).index]] ? 1 : 0;
  getPad1(nes).index = (getPad1(nes).index + 1) % padVet.length;
  return [data, nes];
};

export const writePad1: Write = (_, value, nes) => {
  getPad1(nes).write = [value, ...getPad1(nes).write].slice(0, 2);
  const { write } = getPad1(nes);
  if (write[0] === 0 && write[1] === 1) getPad1(nes).index = 0;
  return nes;
};
