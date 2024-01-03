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

export const mirrorBuilder = (bus: Bus, ...mirror: number[]): Bus => {
  return bus.map((b, i) => {
    if (mirror.includes(i)) return { ...b, write: mirrorWrite(...mirror) };
    return b;
  });
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

export const buildMirrorArray8bytes = (startAddr: number) => {
  const LAST_ADDR = 0x3fff;
  const arr = [];
  for (let addr = startAddr; addr <= LAST_ADDR; addr += 8) {
    arr.push(addr);
  }
  return arr;
};

export const mirror8BytesWrite = (startAddr: number, bus: Bus) =>
  mirrorBuilder(bus, ...buildMirrorArray8bytes(startAddr));

export const initBus = (): Bus => {
  let bus = "_"
    .repeat(0x10000)
    .split("")
    .map(() => ({ data: 0, read: simpleRead, write: simpleWrite }));
  for (let addr = 0x0000; addr <= 0x07ff; addr++)
    bus = mirrorBuilder(bus, addr, addr + 0x0800, addr + 0x1000, addr + 0x1800);
  for (let addr = 0x2000; addr <= 0x2007; addr++)
    bus = mirror8BytesWrite(addr, bus);
  return bus;
};

export { simpleRead, simpleWrite, readBus, writeBus };

export type { Bus };
