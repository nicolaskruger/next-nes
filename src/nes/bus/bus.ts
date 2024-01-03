import { Dictionary } from "../helper/dictionary";
import { Nes, nesBuilder } from "../nes";

type OperatorBus = {
  read: (addr: number, nes: Nes) => number;
  write: (addr: number, value: number, nes: Nes) => Nes;
  data: number;
};

type Bus = OperatorBus[];

const simpleRead = (addr: number, nes: Nes) => nes.bus[addr].data;

const simpleWrite = (addr: number, value: number, nes: Nes): Nes => ({
  ...nes,
  bus: nes.bus.map((v, i) => (i === addr ? { ...v, data: value } : { ...v })),
});

export const mirrorWrite =
  (...mirror: number[]) =>
  (addr: number, value: number, nes: Nes): Nes => {
    return mirror.reduce(
      (curr, acc) => nesBuilder(curr).directWrite(acc, value).build(),
      nes
    );
  };

const readBus = (addr: number, nes: Nes) => {
  if (addr >= 0 && addr <= 0xffff) return nes.bus[addr].read(addr, nes);
  throw new Error("cross the border off buss on read");
};

const writeBus = (addr: number, value: number, nes: Nes): Nes => {
  if (addr >= 0 && addr <= 0xffff)
    return {
      ...nes.bus[addr].write(addr, value, nes),
    };
  throw new Error("cross the border off buss on write");
};

export { simpleRead, simpleWrite, readBus, writeBus };

export type { Bus };
