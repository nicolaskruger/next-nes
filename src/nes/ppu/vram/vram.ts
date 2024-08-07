import { Bus, Read, mirrorBuilder } from "@/nes/bus/bus";
import { toBinary8Bits } from "@/nes/helper/binary";
import { pa, paOfPa } from "@/nes/helper/pa";
import { repeat } from "@/nes/helper/repeat";
import { Nes, getVRam, getVRamBus as getVRamBus, nesBuilder } from "@/nes/nes";
import { refreshPallet } from "../refresh/refresh";

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
    isInRange: (addr) => addr === 0x3f00,
    bussBuilder: (addr, bus) =>
      mirrorBuilder(
        bus,
        simpleWriteVRam,
        simpleReadVRam,
        ...paOfPa(paOfPa(pa(addr, 0x0004, 8), 0x0020, 7), 0x4000, 4)
      ),
  },
  {
    isInRange: (addr) => pa(0x3f04, 0x04, 7).includes(addr),
    bussBuilder: (addr, bus) => bus,
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

const writeRefreshPallet = (addr: number, value: number, nes: Nes): Nes => {
  refreshPallet(nes, addr);
  return simpleWriteVRam(addr, value, nes);
};

const initPpuVRam = (): Bus => {
  let bus = repeat(0x10000).map((_, addr) =>
    addr >= 0x3f00 && addr < 0x3f20
      ? {
          data: 0,
          read: simpleReadVRam,
          write: simpleWriteVRam,
        }
      : {
          data: 0,
          read: simpleReadVRam,
          write: writeRefreshPallet,
        }
  );

  for (let addr = 0x0000; addr <= 0x3fff; addr++) {
    bus = mirrorBuilderVram
      .find(({ isInRange }) => isInRange(addr))
      ?.bussBuilder(addr, bus) as Bus;
  }
  return bus;
};

type Tile = [number[][], Nes];

type GetPatter = (index: number, nes: Nes) => Tile;

export const getTile: GetPatter = (index, nes) => {
  const getStartIndex = () => index * 0x10;

  const readPosTableOne = (pos: number) => getStartIndex() + pos;
  const readPosTableTwo = (pos: number) => getStartIndex() + pos + 8;

  const sumData = (a: number, b: number) => {
    const aBinary = toBinary8Bits(a);
    const bBinary = toBinary8Bits(b);
    return aBinary.map((v, i) => v | (bBinary[i] << 1));
  };

  const { nes: _nes, arr } = repeat(8).reduce(
    ({ nes, arr }, _, pos) => {
      const [dataTableOne, nesTableOne] = readVRam(readPosTableOne(pos), nes);
      const [dataTableTwo, nesTableTwo] = readVRam(
        readPosTableTwo(pos),
        nesTableOne
      );
      return {
        nes: nesTableTwo,
        arr: [...arr, sumData(dataTableOne, dataTableTwo)],
      };
    },
    { nes, arr: [] } as { arr: number[][]; nes: Nes }
  );
  return [arr, _nes];
};

export type ReadRange = [number[], Nes];
export type ReadNameTable = [number[], Nes];

export const writeRangeVRam = (
  startIndex: number,
  values: number[],
  nes: Nes
): Nes => {
  return values.reduce(
    (acc, curr, index) => writeVRam(startIndex + index, curr, acc),
    nes
  );
};

export const readRangeVRam = (startIndex: number, length: number, nes: Nes) => {
  return repeat(length).reduce(
    ([values, nes], _, index) => {
      const [data, _nes] = readVRam(index + startIndex, nes);
      return [[...values, data], _nes] as ReadNameTable;
    },
    [[], nes] as ReadNameTable
  );
};

export const readNameTable = (nameTable: number, nes: Nes): ReadNameTable => {
  return readRangeVRam(nameTable, 0x3c0, nes);
};

export const readAttributeTable = (
  attributeTable: number,
  nes: Nes
): ReadRange => {
  return readRangeVRam(attributeTable, 0x40, nes);
};

export const horizontalMirror = (nes: Nes): Nes => {
  let vramBus = getVRamBus(nes);

  for (let addr = 0x2000; addr < 0x2400; addr++) {
    vramBus = mirrorBuilder(
      vramBus,
      simpleWriteVRam,
      simpleReadVRam,
      addr,
      addr + 0x400
    );
  }
  for (let addr = 0x2800; addr < 0x2c00; addr++) {
    vramBus = mirrorBuilder(
      vramBus,
      simpleWriteVRam,
      simpleReadVRam,
      addr,
      addr + 0x400
    );
  }
  return nesBuilder(nes)
    .vram({ ...getVRam(nes), bus: vramBus })
    .build();
};

export const verticalMirror = (nes: Nes): Nes => {
  let vramBus = getVRamBus(nes);

  for (let addr = 0x2000; addr < 0x2400; addr++) {
    vramBus = mirrorBuilder(
      vramBus,
      simpleWriteVRam,
      simpleReadVRam,
      addr,
      addr + 0x800
    );
  }
  for (let addr = 0x2400; addr < 0x2800; addr++) {
    vramBus = mirrorBuilder(
      vramBus,
      simpleWriteVRam,
      simpleReadVRam,
      addr,
      addr + 0x800
    );
  }
  return nesBuilder(nes)
    .vram({ ...getVRam(nes), bus: vramBus })
    .build();
};

export const singleScreen = (nes: Nes): Nes => {
  let vramBus = getVRamBus(nes);

  for (let addr = 0x2000; addr < 0x2400; addr++) {
    vramBus = mirrorBuilder(
      vramBus,
      simpleWriteVRam,
      simpleReadVRam,
      ...pa(addr, 0x400, 4)
    );
  }
  return nesBuilder(nes)
    .vram({ ...getVRam(nes), bus: vramBus })
    .build();
};

export const fourScreen = (nes: Nes): Nes => nes;

export { initPpuVRam, readVRam, writeVRam };
