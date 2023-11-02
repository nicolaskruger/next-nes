import { write } from "fs";
import { Cpu } from "../cpu/cpu";
import { Nes } from "../nes";
import { Bus, read, simpleRead, simpleWrite } from "./bus";

const initBus = (): Bus => [
  {
    data: 1,
    read: simpleRead,
    write: simpleWrite,
  },
];

const initCpu = (): Cpu => ({
  ACC: 0,
  PC: 0,
  STATUS: 0,
  STK: 0,
  X: 0,
  Y: 0,
});

const initNes = (): Nes => ({
  bus: initBus(),
  cpu: initCpu(),
  ppu: {},
});

describe("BUS", () => {
  test("throw error when read bus less then zero", () => {
    const nes = initNes();

    expect(() => read(-1, nes)).toThrow(Error);
  });

  test("throw error when read bus more then 0xffff", () => {
    const nes = initNes();

    expect(() => read(0x10000, nes)).toThrow(Error);
  });

  test("should read value 1 when read bus addr 0", () => {
    const nes = initNes();

    expect(read(0, nes)).toBe(1);
  });
});
