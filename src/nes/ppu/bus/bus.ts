import { Bus, mirrorBuilder } from "@/nes/bus/bus";
import { pa, paOfPa } from "@/nes/helper/pa";
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
  if (addr >= 0 && addr <= 0xffff)
    return getBussPpu(nes)[addr].write(addr, value, nes);
  throw new Error("PPU VRAM out of range");
};

const isInRange = (addr: number, start: number, finish: number) =>
  addr >= start && addr <= finish;

type MirrorBuilderPpu = {
  isInRange: (addr: number) => boolean;
  bussBuilder: (addr: number, bus: Bus) => Bus;
};

const mirrorBuilderPpu: MirrorBuilderPpu[] = [
  {
    isInRange: (addr) => isInRange(addr, 0x2000, 0x2eff),
    bussBuilder: (addr, bus) =>
      mirrorBuilder(
        bus,
        simpleWritePpu,
        ...paOfPa([addr, addr + 0x1000], 0x4000, 4)
      ),
  },
  {
    isInRange: (addr) => isInRange(addr, 0x3f00, 0x3f20),
    bussBuilder: (addr, bus) =>
      mirrorBuilder(
        bus,
        simpleWritePpu,
        ...paOfPa(pa(addr, 0x0020, 7), 0x4000, 4)
      ),
  },
  {
    isInRange: (addr) =>
      isInRange(addr, 0x3000, 0x3eff) || isInRange(addr, 0x3f00, 0x3f20),
    bussBuilder: (addr, bus) => bus,
  },
  {
    isInRange: (addr) => true,
    bussBuilder: (addr, bus) =>
      mirrorBuilder(bus, simpleWritePpu, ...pa(addr, 0x4000, 4)),
  },
];

const initPpuBus = (): Bus => {
  let bus = "_"
    .repeat(0x10000)
    .split("")
    .map((_) => ({
      data: 0,
      read: simpleReadPpu,
      write: simpleWritePpu,
    }));

  for (let addr = 0x0000; addr <= 0x3fff; addr++) {
    bus = mirrorBuilderPpu
      .find(({ isInRange }) => isInRange(addr))
      ?.bussBuilder(addr, bus) as Bus;
  }
  return bus;
};

export { initPpuBus, readPpu, writePpu };
