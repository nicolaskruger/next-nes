import { Bus } from "@/nes/bus/bus";
import { Nes } from "@/nes/nes";

const readPpu = (addr: number, nes: Nes): Number => {
  return nes.ppu.bus[addr].read(addr, nes);
};

const writePpu = (addr: number, value: number, nes: Nes): Nes => {
  return nes.ppu.bus[addr].write(addr, value, nes);
};

const initPpuBus = (): Bus => {
  throw new Error("not implemented");
};

export { initPpuBus, readPpu, writePpu };
