import { repeat } from "../helper/repeat";
import { Nes } from "../nes";
import {
  write2006AddrVRam,
  write2007DataVRam,
  write2004SprRam,
  read2004SprRam,
  read2007DataVRam,
  DMA,
  write4014DMA,
} from "../ppu/registers/registers";
import { write2005scroll } from "../ppu/scroll/scroll";

export type ReadData = [number, Nes];

type Bus = OperatorBus[];

export type Write = (addr: number, value: number, nes: Nes) => Nes;

export type Read = (addr: number, nes: Nes) => ReadData;

type OperatorBus = {
  read: Read;
  write: Write;
  data: number;
};

export const getNesBus = (nes: Nes) => nes.bus;

const simpleRead: Read = (addr, nes) => [nes.bus[addr].data, nes];

const simpleWrite: Write = (addr, value, nes) => ({
  ...nes,
  bus: nes.bus.map((v, i) => (i === addr ? { ...v, data: value } : { ...v })),
});

/**
 *
 * @param bus mutate the bus
 * @param write
 * @param read
 * @param mirror
 * @returns
 */
export const mirrorBuilder = (
  bus: Bus,
  write: Write,
  read: Read,
  ...mirror: number[]
): Bus => {
  const [addr] = mirror;

  mirror.forEach((m) => {
    bus[m] = {
      ...bus[m],
      write: (_, value, nes) => write(addr, value, nes),
      read: (_, nes) => read(addr, nes),
    };
  });
  return bus;
};

const readBusNes = (addr: number, nes: Nes): ReadData => {
  if (addr >= 0 && addr <= 0xffff) return nes.bus[addr].read(addr, nes);
  throw new Error("cross the border off buss on read");
};

const writeBusNes = (addr: number, value: number, nes: Nes): Nes => {
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

export const mirror8BytesWrite = (
  write: Write,
  read: Read,
  startAddr: number,
  bus: Bus
) => mirrorBuilder(bus, write, read, ...buildMirrorArray8bytes(startAddr));

const wrapperNoAddrWrite =
  (write: (data: number, nes: Nes) => Nes): Write =>
  (addr, data, nes) =>
    write(data, nes);
const wrapperNoAddrRead =
  (read: (nes: Nes) => [number, Nes]): Read =>
  (addr, nes) =>
    read(nes);

const selectRead = (addr: number): Read => {
  if (addr === 0x2004) return wrapperNoAddrRead(read2004SprRam);
  if (addr === 0x2007) return wrapperNoAddrRead(read2007DataVRam);
  return simpleRead;
};

const selectWrite = (addr: number): Write => {
  if (addr === 0x2004) return write2004SprRam;
  if (addr === 0x2005) return wrapperNoAddrWrite(write2005scroll);
  if (addr === 0x2006) return wrapperNoAddrWrite(write2006AddrVRam);
  if (addr === 0x2007) return wrapperNoAddrWrite(write2007DataVRam);
  return simpleWrite;
};

export const initBus = (): Bus => {
  let bus = repeat(0x10000).map(() => ({
    data: 0,
    read: simpleRead,
    write: simpleWrite,
  }));
  for (let addr = 0x0000; addr <= 0x07ff; addr++)
    bus = mirrorBuilder(
      bus,
      simpleWrite,
      simpleRead,
      addr,
      addr + 0x0800,
      addr + 0x1000,
      addr + 0x1800
    );
  for (let addr = 0x2000; addr <= 0x2007; addr++) {
    bus = mirror8BytesWrite(selectWrite(addr), selectRead(addr), addr, bus);
  }
  bus[DMA] = {
    ...bus[DMA],
    write: wrapperNoAddrWrite(write4014DMA),
  };
  return bus;
};

export { simpleRead, simpleWrite, readBusNes, writeBusNes };

export type { Bus };
