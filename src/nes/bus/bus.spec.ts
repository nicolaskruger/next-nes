import { Cpu } from "../cpu/cpu";
import { Nes } from "../nes";
import {
  Bus,
  mirrorWrite,
  readBus,
  simpleRead,
  simpleWrite,
  writeBus,
} from "./bus";

const initBus = (): Bus => [
  {
    data: 1,
    read: simpleRead,
    write: simpleWrite,
  },
];

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
  ppu: {},
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
});
