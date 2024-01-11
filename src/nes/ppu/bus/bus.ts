import { Bus } from "@/nes/bus/bus";
import { Nes, getBussPpu, getPpu, nesBuilder } from "@/nes/nes";

const simpleReadPpu = (addr: number, nes: Nes) => {
  return getBussPpu(nes)[addr].data;
};

const simpleWritePpu = (addr: number, value: number, nes: Nes): Nes => {
  return nesBuilder(nes).bussPpu(addr, value).build();
};

const readPpu = (addr: number, nes: Nes): Number => {
  if (addr >= 0 && addr <= 0xffff) return getBussPpu(nes)[addr].read(addr, nes);
  throw new Error("PPU VRAM out of range");
};

const writePpu = (addr: number, value: number, nes: Nes): Nes => {
  return getBussPpu(nes)[addr].write(addr, value, nes);
};

const initPpuBus = (): Bus => {
  return "_"
    .repeat(0x10000)
    .split("")
    .map((_) => ({
      data: 0,
      read: simpleReadPpu,
      write: simpleWritePpu,
    }));
};

export { initPpuBus, readPpu, writePpu };
