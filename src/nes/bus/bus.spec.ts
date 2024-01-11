import { Cpu } from "../cpu/cpu";
import { Nes } from "../nes";
import {
  Bus,
  mirrorBuilder,
  mirrorWrite,
  readBus,
  simpleRead,
  simpleWrite,
  writeBus,
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

const initBusMirror = (): Bus =>
  "_"
    .repeat(3)
    .split("")
    .map((v) => ({
      data: 1,
      read: simpleRead,
      write: mirrorWrite(0, 1, 2),
    }));

const initCpu = (): Cpu => ({
  ACC: 0,
  PC: 0,
  STATUS: 0,
  STK: 0,
  X: 0,
  Y: 0,
  cycles: 0,
});

const initNes = (): Nes => ({
  bus: initBus(),
  cpu: initCpu(),
  ppu: { bus: [] },
});

describe("BUS", () => {
  test("throw error when read bus less then zero", () => {
    const nes = initNes();

    expect(() => readBus(-1, nes)).toThrow(Error);
  });

  test("throw error when read bus more then 0xffff", () => {
    const nes = initNes();

    expect(() => readBus(0x10000, nes)).toThrow(Error);
  });

  test("should read value 1 when read bus addr 0", () => {
    const nes = initNes();

    expect(readBus(0, nes)).toBe(1);
  });

  test("throw error when write bus less then zero", () => {
    const nes = initNes();

    expect(() => writeBus(-1, 2, nes)).toThrow(Error);
  });

  test("throw error when write bus more then 0xffff", () => {
    const nes = initNes();

    expect(() => writeBus(0x10000, 2, nes)).toThrow(Error);
  });

  test("should write value 2 on bus addr 0", () => {
    const nes = initNes();

    expect(nes.bus[0].data).toBe(1);

    const newNes = writeBus(0, 2, nes);

    expect(newNes.bus[0].data).toBe(2);
  });

  test("should write mirror write value", () => {
    const nes = initNes();
    nes.bus = initBusMirror();

    expect(nes.bus[0].data).toBe(0x1);

    const _nes = writeBus(0x0000, 2, nes);

    _nes.bus.forEach((b) => {
      expect(b.data).toBe(2);
    });
  });

  test("mirror builder", () => {
    let nes = initNes();
    nes.bus = "_"
      .repeat(5)
      .split("")
      .map((_) => initBus()[0]);

    nes.bus = mirrorBuilder(nes.bus, 0, 4);

    nes = writeBus(0, 2, nes);

    expect(nes.bus.map((b) => b.data)).toStrictEqual([2, 1, 1, 1, 2]);
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

    nes.bus = mirror8BytesWrite(0x2000, nes.bus);
    nes = writeBus(0x2000, 2, nes);

    expect(readBus(0x2000, nes)).toBe(2);
    expect(readBus(0x2008, nes)).toBe(2);
    expect(readBus(0x2010, nes)).toBe(2);
    expect(readBus(0x3ff8, nes)).toBe(2);
  });
  test("init buss", () => {
    let nes = initNes();
    nes.bus = initB();

    expect(nes.bus.length).toBe(0x10000);

    nes = writeBus(0, 3, nes);

    expect(readBus(0, nes)).toBe(3);
    expect(readBus(0x0800, nes)).toBe(3);
    expect(readBus(0x1000, nes)).toBe(3);
    expect(readBus(0x1800, nes)).toBe(3);

    nes = writeBus(0x2000, 4, nes);

    expect(readBus(0x2000, nes)).toBe(4);
    expect(readBus(0x2008, nes)).toBe(4);
    expect(readBus(0x2010, nes)).toBe(4);
    expect(readBus(0x3ff8, nes)).toBe(4);
  });
});
