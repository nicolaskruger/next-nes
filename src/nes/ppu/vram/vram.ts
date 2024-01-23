import { Bus, Read, mirrorBuilder } from "@/nes/bus/bus";
import { pa, paOfPa } from "@/nes/helper/pa";
import { Nes, getVRamBus as getVRamBus, nesBuilder } from "@/nes/nes";

export type AddrVRamStatus = "low" | "hight";

export type VRam = {
  bus: Bus;
  addrStatus: AddrVRamStatus;
  addr: number;
  firstRead: boolean;
};

export const initVram = (): VRam => ({
  bus: initPpuVRam(),
  addrStatus: "hight",
  firstRead: true,
  addr: 0x0000,
});

export const getVRamAddr = (nes: Nes) => nes.ppu.vram.addr;
export const getFirstRead = (nes: Nes) => nes.ppu.vram.firstRead;

const simpleReadVRam: Read = (addr, nes) => {
  return [getVRamBus(nes)[addr].data, nes];
};

const simpleWriteVRam = (addr: number, value: number, nes: Nes): Nes => {
  return nesBuilder(nes).vramBus(addr, value).build();
};

const readVRam: Read = (addr, nes) => {
  if (addr >= 0 && addr <= 0xffff) return getVRamBus(nes)[addr].read(addr, nes);
  throw new Error("PPU VRAM out of range");
};

const writeVRam = (addr: number, value: number, nes: Nes): Nes => {
  if (addr >= 0 && addr <= 0xffff)
    return getVRamBus(nes)[addr].write(addr, value, nes);
  throw new Error("PPU VRAM out of range");
};

const isInRange = (addr: number, start: number, finish: number) =>
  addr >= start && addr <= finish;

type MirrorBuilderPpu = {
  isInRange: (addr: number) => boolean;
  bussBuilder: (addr: number, bus: Bus) => Bus;
};

const mirrorBuilderVram: MirrorBuilderPpu[] = [
  {
    isInRange: (addr) => isInRange(addr, 0x2000, 0x2eff),
    bussBuilder: (addr, bus) =>
      mirrorBuilder(
        bus,
        simpleWriteVRam,
        simpleReadVRam,
        ...paOfPa([addr, addr + 0x1000], 0x4000, 4)
      ),
  },
  {
    isInRange: (addr) => isInRange(addr, 0x3f00, 0x3f1f),
    bussBuilder: (addr, bus) =>
      mirrorBuilder(
        bus,
        simpleWriteVRam,
        simpleReadVRam,
        ...paOfPa(pa(addr, 0x0020, 7), 0x4000, 4)
      ),
  },
  {
    isInRange: (addr) =>
      isInRange(addr, 0x3000, 0x3eff) || isInRange(addr, 0x3f20, 0x3fff),
    bussBuilder: (addr, bus) => bus,
  },
  {
    isInRange: (addr) => true,
    bussBuilder: (addr, bus) =>
      mirrorBuilder(
        bus,
        simpleWriteVRam,
        simpleReadVRam,
        ...pa(addr, 0x4000, 4)
      ),
  },
];

const initPpuVRam = (): Bus => {
  let bus = "_"
    .repeat(0x10000)
    .split("")
    .map((_) => ({
      data: 0,
      read: simpleReadVRam,
      write: simpleWriteVRam,
    }));

  for (let addr = 0x0000; addr <= 0x3fff; addr++) {
    bus = mirrorBuilderVram
      .find(({ isInRange }) => isInRange(addr))
      ?.bussBuilder(addr, bus) as Bus;
  }
  return bus;
};

export { initPpuVRam, readVRam, writeVRam };
