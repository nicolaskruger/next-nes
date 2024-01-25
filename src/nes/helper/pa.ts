import { repeat } from "./repeat";

export const pa = (init: number, radiant: number, size: number) =>
  repeat(size).map((_, i) => init + radiant * i);

export const paOfPa = (values: number[], radiant: number, size: number) =>
  values
    .map((init) => pa(init, radiant, size))
    .reduce((acc, curr) => [...acc, ...curr], []);
