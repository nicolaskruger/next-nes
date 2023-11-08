import { Nes } from "@/nes/nes";
import {
  ABS,
  ABSX,
  ABSY,
  ACC,
  IMM,
  IMP,
  INDEXED_INDIRECT,
  INDIRECT,
  INDIRECT_INDEXED,
  RELATIVE,
  ZERO_PAGE,
  ZERO_PAGE_X,
  ZERO_PAGE_Y,
} from "./addr";
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

    const { cross, data, nes: newNes } = IMP(nes);

    expect(cross).toBeFalsy();
    expect(newNes.cpu.PC).toBe(1);
    expect(data).toBe(0);
  });

  test("Accumulator test", () => {
    const nes: Nes = initNes();

    nes.cpu.ACC = 1;

    const { cross, data, nes: newNes } = ACC(nes);

    expect(cross).toBeFalsy();
    expect(newNes.cpu.PC).toBe(1);
    expect(data).toBe(1);
  });

  test("Immediate test", () => {
    const nes: Nes = initNes();

    expect(nes.cpu.PC).toBe(0);

    const { cross, data, nes: newNes } = IMM(nes);

    expect(cross).toBe(false);

    expect(data).toBe(1);

    expect(newNes.cpu.PC).toBe(2);
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

    expect(newNes.cpu.PC).toBe(0x0102);
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

    expect(newNes.cpu.PC).toBe(0x0102);
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

    expect(newNes.cpu.PC).toBe(0x0102);
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

    expect(newNes.cpu.PC).toBe(0x0102);
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

    expect(newNes.cpu.PC).toBe(0x0102);
  });

  test("Zero page, y no cross border", () => {
    const nes = initNesAllRam();

    nes.cpu.PC = 0x0100;

    nes.cpu.Y = 0x0f;

    nes.bus[0x0101].data = 0x80;

    nes.bus[0x8f].data = 5;

    const { cross, data, nes: newNes } = ZERO_PAGE_Y(nes);

    expect(cross).toBe(false);

    expect(data).toBe(5);

    expect(newNes.cpu.PC).toBe(0x0102);
  });
  test("Zero page, y cross border", () => {
    const nes = initNesAllRam();

    nes.cpu.PC = 0x0100;

    nes.cpu.Y = 0xff;

    nes.bus[0x0101].data = 0x80;

    nes.bus[0x7f].data = 5;

    const { cross, data, nes: newNes } = ZERO_PAGE_Y(nes);

    expect(cross).toBe(true);

    expect(data).toBe(5);

    expect(newNes.cpu.PC).toBe(0x0102);
  });
  test("relative positive value", () => {
    const nes = initNesAllRam();

    nes.bus[0x1].data = 0x05;

    const { cross, data, nes: newNes } = RELATIVE(nes);

    expect(cross).toBe(false);

    expect(data).toBe(5);

    expect(newNes.cpu.PC).toBe(0x2);
  });

  test("relative negative value", () => {
    const nes = initNesAllRam();

    nes.bus[0x1].data = 0xff;

    const { cross, data, nes: newNes } = RELATIVE(nes);

    expect(cross).toBe(false);

    expect(data).toBe(-1);

    expect(newNes.cpu.PC).toBe(0x2);
  });
  test("relative all negative values", () => {
    let nes = initNesAllRam();

    nes.bus = "_"
      .repeat(0x100)
      .split("")
      .map((v, i) => [
        {
          data: 0xff - i,
          read: simpleRead,
          write: simpleWrite,
        },
        {
          data: 0xff - i,
          read: simpleRead,
          write: simpleWrite,
        },
      ])
      .reduce((acc, curr) => [...acc, ...curr], []);

    for (let i = 0; i < 128; i++) {
      const { cross, data, nes: newNes } = RELATIVE(nes);

      nes = newNes;
      expect(cross).toBe(false);

      expect(data).toBe(-1 - i);

      expect(nes.cpu.PC).toBe((i + 1) * 2);
    }
  });

  test("absolute test", () => {
    const nes = initNesAllRam();

    nes.bus[1] = {
      ...nes.bus[1],
      data: 0x34,
    };
    nes.bus[2] = {
      ...nes.bus[1],
      data: 0x12,
    };

    nes.bus[0x1234] = {
      ...nes.bus[0x1234],
      data: 0x77,
    };

    const { cross, data, nes: newNes } = ABS(nes);

    expect(cross).toBe(false);

    expect(data).toBe(0x77);

    expect(newNes.cpu.PC).toBe(3);
  });

  test("absolute x, test, not cross border", () => {
    const nes = initNesAllRam();

    nes.bus[1] = {
      ...nes.bus[1],
      data: 0x30,
    };
    nes.bus[2] = {
      ...nes.bus[1],
      data: 0x12,
    };

    nes.bus[0x1234] = {
      ...nes.bus[0x1234],
      data: 0x77,
    };

    nes.cpu.X = 0x04;

    const { cross, data, nes: newNes } = ABSX(nes);

    expect(cross).toBe(false);

    expect(data).toBe(0x77);

    expect(newNes.cpu.PC).toBe(3);
  });
  test("absolute x, test, cross border", () => {
    const nes = initNesAllRam();

    nes.bus[1] = {
      ...nes.bus[1],
      data: 0x01,
    };
    nes.bus[2] = {
      ...nes.bus[1],
      data: 0x12,
    };

    nes.bus[0x1300] = {
      ...nes.bus[0x1300],
      data: 0x77,
    };

    nes.cpu.X = 0xff;

    const { cross, data, nes: newNes } = ABSX(nes);

    expect(cross).toBe(true);

    expect(data).toBe(0x77);

    expect(newNes.cpu.PC).toBe(3);
  });

  test("absolute y, test, not cross border", () => {
    const nes = initNesAllRam();

    nes.bus[1] = {
      ...nes.bus[1],
      data: 0x30,
    };
    nes.bus[2] = {
      ...nes.bus[1],
      data: 0x12,
    };

    nes.bus[0x1234] = {
      ...nes.bus[0x1234],
      data: 0x77,
    };

    nes.cpu.Y = 0x04;

    const { cross, data, nes: newNes } = ABSY(nes);

    expect(cross).toBe(false);

    expect(data).toBe(0x77);

    expect(newNes.cpu.PC).toBe(3);
  });
  test("absolute y, test, cross border", () => {
    const nes = initNesAllRam();

    nes.bus[1] = {
      ...nes.bus[1],
      data: 0x01,
    };
    nes.bus[2] = {
      ...nes.bus[1],
      data: 0x12,
    };

    nes.bus[0x1300] = {
      ...nes.bus[0x1300],
      data: 0x77,
    };

    nes.cpu.Y = 0xff;

    const { cross, data, nes: newNes } = ABSY(nes);

    expect(cross).toBe(true);

    expect(data).toBe(0x77);

    expect(newNes.cpu.PC).toBe(3);
  });
  test("indirect, when cross border on address and value", () => {
    const nes = initNesAllRam();

    nes.bus[1] = {
      ...nes.bus[1],
      data: 0xff,
    };
    nes.bus[2] = {
      ...nes.bus[1],
      data: 0x12,
    };

    nes.bus[0x12ff] = {
      ...nes.bus[0x12ff],
      data: 0xff,
    };
    nes.bus[0x1200] = {
      ...nes.bus[0x1200],
      data: 0x34,
    };

    const { cross, data, nes: newNes } = INDIRECT(nes);

    expect(cross).toBe(true);
    expect(data).toBe(0x34ff);
    expect(newNes.cpu.PC).toBe(3);
  });

  test("indirect, when cross border on address and value", () => {
    const nes = initNesAllRam();

    nes.bus[1] = {
      ...nes.bus[1],
      data: 0x34,
    };
    nes.bus[2] = {
      ...nes.bus[1],
      data: 0x12,
    };

    nes.bus[0x1234] = {
      ...nes.bus[0x1234],
      data: 0x21,
    };
    nes.bus[0x1235] = {
      ...nes.bus[0x1235],
      data: 0x43,
    };

    const { cross, data, nes: newNes } = INDIRECT(nes);

    expect(cross).toBe(false);
    expect(data).toBe(0x4321);
    expect(newNes.cpu.PC).toBe(3);
  });

  test("indexed indirect, when cross border", () => {
    const nes = initNesAllRam();

    nes.cpu.X = 0xf;

    nes.bus[1] = {
      ...nes.bus[1],
      data: 0xf0,
    };
    nes.bus[0xff] = {
      ...nes.bus[0xff],
      data: 0x01,
    };
    nes.bus[0x00] = {
      ...nes.bus[0x00],
      data: 0x2,
    };
    nes.bus[0x0201] = {
      ...nes.bus[0x00],
      data: 0x12,
    };

    const { cross, data, nes: newNes } = INDEXED_INDIRECT(nes);

    expect(cross).toBe(true);

    expect(data).toBe(0x12);

    expect(newNes.cpu.PC).toBe(2);
  });

  test("indexed indirect, no cross border", () => {
    const nes = initNesAllRam();

    nes.cpu.X = 0xe;

    nes.bus[1] = {
      ...nes.bus[1],
      data: 0xf0,
    };
    nes.bus[0xfe] = {
      ...nes.bus[0x00],
      data: 0x2,
    };
    nes.bus[0xff] = {
      ...nes.bus[0xff],
      data: 0x01,
    };
    nes.bus[0x0102] = {
      ...nes.bus[0x00],
      data: 0x12,
    };

    const { cross, data, nes: newNes } = INDEXED_INDIRECT(nes);

    expect(cross).toBe(false);

    expect(data).toBe(0x12);

    expect(newNes.cpu.PC).toBe(2);
  });

  test("indirect indexed, when cross border", () => {
    const nes = initNesAllRam();

    nes.cpu.Y = 0xf;

    nes.bus[1] = {
      ...nes.bus[1],
      data: 0xff,
    };
    nes.bus[0xff] = {
      ...nes.bus[0x00],
      data: 0xf1,
    };
    nes.bus[0x00] = {
      ...nes.bus[0x00],
      data: 0x12,
    };
    nes.bus[0x1200] = {
      ...nes.bus[0x1200],
      data: 0x2,
    };

    const { cross, data, nes: newNes } = INDIRECT_INDEXED(nes);

    expect(cross).toBe(true);

    expect(data).toBe(0x2);

    expect(newNes.cpu.PC).toBe(2);
  });

  test("indirect indexed, no cross border", () => {
    const nes = initNesAllRam();

    nes.cpu.Y = 0xf;

    nes.bus[1] = {
      ...nes.bus[1],
      data: 0xfe,
    };
    nes.bus[0xfe] = {
      ...nes.bus[0x00],
      data: 0x10,
    };
    nes.bus[0xff] = {
      ...nes.bus[0x00],
      data: 0xf1,
    };
    nes.bus[0xf11f] = {
      ...nes.bus[0x1200],
      data: 0x2,
    };

    const { cross, data, nes: newNes } = INDIRECT_INDEXED(nes);

    expect(cross).toBe(false);

    expect(data).toBe(0x2);

    expect(newNes.cpu.PC).toBe(2);
  });
});
