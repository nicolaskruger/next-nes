import { initBanks } from "../banks/bank";
import { Cpu } from "../cpu/cpu";
import { Nes } from "../nes";
import { initPpu, Ppu } from "../ppu/ppu";
import { initScroll } from "../ppu/scroll/scroll";
import { initVram } from "../ppu/vram/vram";
import {
  Bus,
  mirrorBuilder,
  readBusNes,
  simpleRead,
  simpleWrite,
  writeBusNes,
  initBus as initB,
  buildMirrorArray8bytes,
  mirror8BytesWrite,
} from "./bus";

const initBus = (): Bus => [
  {
    data: 1,
    read: simpleRead,
    write: simpleWrite,
  },
];

const initBusSimple = (): Bus =>
  "_"
    .repeat(0x10000)
    .split("")
    .map((v) => ({
      data: 1,
      read: simpleRead,
      write: simpleWrite,
    }));

const initBusMirror = (): Bus => {
  const bus = "_"
    .repeat(3)
    .split("")
    .map((v) => ({
      data: 1,
      read: simpleRead,
      write: simpleWrite,
    }));

  return mirrorBuilder(bus, simpleWrite, simpleRead, 0, 1, 2);
};

const initCpu = (): Cpu =>
  ({
    ACC: 0,
    PC: 0,
    STATUS: 0,
    STK: 0,
    X: 0,
    Y: 0,
  } as Cpu);

const initNes = (): Nes => ({
  banks: initBanks(),
  bus: initBus(),
  cpu: initCpu(),
  ppu: {
    vram: initVram(),
    sprRam: [],
    scroll: initScroll(),
  } as unknown as Ppu,
});

describe("BUS", () => {
  test("throw error when read bus less then zero", () => {
    const nes = initNes();

    expect(() => readBusNes(-1, nes)).toThrow(Error);
  });

  test("throw error when read bus more then 0xffff", () => {
    const nes = initNes();

    expect(() => readBusNes(0x10000, nes)).toThrow(Error);
  });

  test("should read value 1 when read bus addr 0", () => {
    const nes = initNes();

    const [data] = readBusNes(0, nes);

    expect(data).toBe(1);
  });

  test("throw error when write bus less then zero", () => {
    const nes = initNes();

    expect(() => writeBusNes(-1, 2, nes)).toThrow(Error);
  });

  test("throw error when write bus more then 0xffff", () => {
    const nes = initNes();

    expect(() => writeBusNes(0x10000, 2, nes)).toThrow(Error);
  });

  test("should write value 2 on bus addr 0", () => {
    const nes = initNes();

    expect(nes.bus[0].data).toBe(1);

    const newNes = writeBusNes(0, 2, nes);

    expect(newNes.bus[0].data).toBe(2);
  });

  test("should write mirror write value", () => {
    const nes = initNes();
    nes.bus = initBusMirror();

    expect(nes.bus[0].data).toBe(0x1);

    const _nes = writeBusNes(0x0000, 2, nes);

    _nes.bus.forEach((b, addr) => {
      expect(readBusNes(addr, _nes)[0]).toBe(2);
    });
  });

  test("mirror builder", () => {
    let nes = initNes();
    nes.bus = "_"
      .repeat(5)
      .split("")
      .map((_) => initBus()[0]);

    nes.bus = mirrorBuilder(nes.bus, simpleWrite, simpleRead, 0, 4);

    nes = writeBusNes(0, 2, nes);

    expect(nes.bus.map((b, addr) => readBusNes(addr, nes)[0])).toStrictEqual([
      2, 1, 1, 1, 2,
    ]);
  });

  test("build mirror array every 8 bytes", () => {
    const [a, b, c, ...arr] = buildMirrorArray8bytes(0x2000);
    const last = arr.slice(-1)[0];
    expect(a).toBe(0x2000);
    expect(b).toBe(0x2008);
    expect(c).toBe(0x2010);
    expect(last).toBe(0x3ff8);
  });

  test("mirror 8 byte write", () => {
    let nes = initNes();
    nes.bus = initBusSimple();

    nes.bus = mirror8BytesWrite(simpleWrite, simpleRead, 0x2000, nes.bus);
    nes = writeBusNes(0x2000, 2, nes);

    expect(readBusNes(0x2000, nes)[0]).toBe(2);
    expect(readBusNes(0x2008, nes)[0]).toBe(2);
    expect(readBusNes(0x2010, nes)[0]).toBe(2);
    expect(readBusNes(0x3ff8, nes)[0]).toBe(2);
  });
  test("init buss", () => {
    let nes = initNes();
    nes.bus = initB();

    expect(nes.bus.length).toBe(0x10000);

    nes = writeBusNes(0, 3, nes);

    expect(readBusNes(0, nes)[0]).toBe(3);
    expect(readBusNes(0x0800, nes)[0]).toBe(3);
    expect(readBusNes(0x1000, nes)[0]).toBe(3);
    expect(readBusNes(0x1800, nes)[0]).toBe(3);

    nes = writeBusNes(0x2000, 4, nes);

    expect(readBusNes(0x2000, nes)[0]).toBe(4);
    expect(readBusNes(0x2008, nes)[0]).toBe(4);
    expect(readBusNes(0x2010, nes)[0]).toBe(4);
    expect(readBusNes(0x3ff8, nes)[0]).toBe(4);
  });
});
