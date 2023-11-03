import { Nes } from "@/nes/nes";
import { ACC, IMM, IMP, ZERO_PAGE, ZERO_PAGE_X } from "./addr";
import { Cpu } from "../cpu";
import { Bus, simpleRead, simpleWrite } from "@/nes/bus/bus";

const initBusAllRam = (): Bus =>
  "_"
    .repeat(0x10000)
    .split("")
    .map((_) => ({
      data: 0,
      read: simpleRead,
      write: simpleWrite,
    }));
const initBus = (): Bus =>
  "_"
    .repeat(0x2)
    .split("")
    .map((_, i) => ({
      data: i,
      read: simpleRead,
      write: simpleWrite,
    }));

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

const initNesAllRam = (): Nes => {
  const nes = initNes();
  nes.bus = initBusAllRam();
  return nes;
};

describe("test addressing mode", () => {
  test("Implicit test", () => {
    const nes: Nes = initNes();

    const { cross, data } = IMP(nes);

    expect(cross).toBeFalsy();
    expect(data).toBe(0);
  });

  test("Accumulator test", () => {
    const nes: Nes = initNes();

    nes.cpu.ACC = 1;

    const { cross, data } = ACC(nes);

    expect(cross).toBeFalsy();
    expect(data).toBe(1);
  });

  test("Immediate test", () => {
    const nes: Nes = initNes();

    expect(nes.cpu.PC).toBe(0);

    const { cross, data, nes: newNes } = IMM(nes);

    expect(cross).toBe(false);

    expect(data).toBe(1);

    expect(newNes.cpu.PC).toBe(1);
  });
  test("Zero page test", () => {
    const nes = initNesAllRam();

    nes.cpu.PC = 0x0100;

    const addr = 0xaa;

    nes.bus[0x0101].data = addr;

    nes.bus[addr].data = 5;

    const { cross, data, nes: newNes } = ZERO_PAGE(nes);

    expect(cross).toBe(false);

    expect(data).toBe(5);

    expect(newNes.cpu.PC).toBe(0x0101);
  });

  test("Zero page, x no cross border", () => {
    const nes = initNesAllRam();

    nes.cpu.PC = 0x0100;

    nes.cpu.X = 0x0f;

    nes.bus[0x0101].data = 0x80;

    nes.bus[0x8f].data = 5;

    const { cross, data, nes: newNes } = ZERO_PAGE_X(nes);

    expect(cross).toBe(false);

    expect(data).toBe(5);

    expect(newNes.cpu.PC).toBe(0x0101);
  });
  test("Zero page, x cross border", () => {
    const nes = initNesAllRam();

    nes.cpu.PC = 0x0100;

    nes.cpu.X = 0xff;

    nes.bus[0x0101].data = 0x80;

    nes.bus[0x7f].data = 5;

    const { cross, data, nes: newNes } = ZERO_PAGE_X(nes);

    expect(cross).toBe(true);

    expect(data).toBe(5);

    expect(newNes.cpu.PC).toBe(0x0101);
  });
});
