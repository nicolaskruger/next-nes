import { Bus, simpleRead, simpleWrite } from "@/nes/bus/bus";
import { Nes } from "@/nes/nes";
import { Cpu } from "../cpu";
import {
  ASL,
  ADC,
  AND,
  BCC,
  BCS,
  BEQ,
  BIT,
  BMI,
  BNE,
  BPL,
  BRK,
  BVC,
  BVS,
  CLC,
  CLD,
  CLI,
  CLV,
  CMP,
  CPX,
  CPY,
  DEC,
  DEX,
  DEY,
  EOR,
  INC,
  INX,
  INY,
  JMP,
  JSR,
  LDA,
  LDX,
  LDY,
  LSR,
  NOP,
  ORA,
  InstructionData,
  PHA,
  PHP,
  PLA,
  PLP,
  ROL,
  ROR,
} from "./instruction";

const initBus = (): Bus =>
  "_"
    .repeat(0x10000)
    .split("")
    .map((_) => ({
      data: 0,
      read: simpleRead,
      write: simpleWrite,
    }));

const initCpu = (): Cpu => ({
  ACC: 0,
  PC: 0,
  STATUS: 0,
  STK: 0xff,
  X: 0,
  Y: 0,
  cycles: 0,
});

const initNes = (): Nes => ({
  bus: initBus(),
  cpu: initCpu(),
  ppu: {},
});

const toCycles = (nes: Nes) => (cycles: number) => {
  expect(nes.cpu.cycles).toBe(cycles);
  return expectNes(nes);
};

const toStatus = (nes: Nes) => (STATUS: number) => {
  expect(nes.cpu.STATUS).toBe(STATUS);
  return expectNes(nes);
};

const toACC = (nes: Nes) => (ACC: number) => {
  expect(nes.cpu.ACC).toBe(ACC);
  return expectNes(nes);
};

const toBuss = (nes: Nes) => (addr: number, value: number) => {
  expect(nes.bus[addr].data).toBe(value);

  return expectNes(nes);
};

const toPC = (nes: Nes) => (PC: number) => {
  expect(nes.cpu.PC).toBe(PC);

  return expectNes(nes);
};

const toSTK = (nes: Nes) => (STK: number) => {
  expect(nes.cpu.STK).toBe(STK);

  return expectNes(nes);
};

const toX = (nes: Nes) => (X: number) => {
  expect(nes.cpu.X).toBe(X);

  return expectNes(nes);
};

const toY = (nes: Nes) => (Y: number) => {
  expect(nes.cpu.Y).toBe(Y);

  return expectNes(nes);
};

function expectNes(nes: Nes) {
  return {
    toACC: toACC(nes),
    toStatus: toStatus(nes),
    toCycles: toCycles(nes),
    toBuss: toBuss(nes),
    toPC: toPC(nes),
    toSTK: toSTK(nes),
    toX: toX(nes),
    toY: toY(nes),
  };
}

describe("instruction test", () => {
  test("ADC,  when carry flag, zero flag is set", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;
    const _nes = ADC({
      data: 0x01,
      nes,
      baseCycles: 2,
      cross: true,
      offsetOnCross: 2,
    });

    expectNes(_nes)
      .toACC(0x00)
      .toStatus((1 << 1) | 1)
      .toCycles(4);
  });
  test("ADC,  when negative flag is set", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;
    const _nes = ADC({
      data: 0x00,
      nes,
      baseCycles: 2,
      cross: false,
      offsetOnCross: 2,
    });

    expectNes(_nes)
      .toStatus(1 << 6)
      .toCycles(2)
      .toACC(0xff);
  });
  test("ADC, when overflow is set", () => {
    const nes = initNes();
    nes.cpu.ACC = 64;
    const data = 64;

    const _nes = ADC({
      data,
      nes,
      baseCycles: 1,
      cross: false,
      offsetOnCross: 0,
    });

    expectNes(_nes)
      .toCycles(1)
      .toACC(128)
      .toStatus((1 << 6) | (1 << 5));
  });

  test("AND, when result is zero", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x00;

    const data = 0xff;

    const _nes = AND({
      baseCycles: 1,
      cross: true,
      offsetOnCross: 2,
      nes,
      data,
    });

    expectNes(_nes)
      .toACC(0x00)
      .toStatus(1 << 1)
      .toCycles(3);
  });

  test("AND, when result is negative", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xf0;

    const data = 0xa0;

    const _nes = AND({
      baseCycles: 1,
      cross: true,
      offsetOnCross: 2,
      nes,
      data,
    });

    expectNes(_nes)
      .toCycles(3)
      .toACC(0xa0)
      .toStatus(1 << 6);
  });

  test("ASL, carry flag and zero flag is set on memory operator", () => {
    const nes = initNes();

    const addr = 0x0000;

    const data = 1 << 7;

    nes.bus[addr].data = data;

    const _nes = ASL({
      baseCycles: 1,
      cross: true,
      data,
      nes,
      offsetOnCross: 1,
      addr,
    });

    expectNes(_nes)
      .toCycles(2)
      .toBuss(addr, 0)
      .toStatus((1 << 1) | 1);
  });

  test("ASL, negative is set on acc operation on memory operator", () => {
    const nes = initNes();

    const addr = 0x0000;

    const data = 1 << 6;

    nes.bus[addr].data = data;

    const _nes = ASL({
      baseCycles: 1,
      cross: true,
      data,
      nes,
      offsetOnCross: 1,
      addr,
    });

    expectNes(_nes)
      .toCycles(2)
      .toStatus(1 << 6)
      .toBuss(addr, 1 << 7);
  });

  test("ASL, when cary flag and zero flag is set on accumulator operator", () => {
    const nes = initNes();
    const data = 0x80;

    const _nes = ASL({
      baseCycles: 1,
      cross: true,
      data,
      nes,
      offsetOnCross: 1,
      acc: true,
    });

    expectNes(_nes)
      .toCycles(2)
      .toStatus((1 << 1) | 1)
      .toACC(0x00);
  });

  test("ASL, when negative is set on acc operation", () => {
    const nes = initNes();
    const data = 0x40;

    const _nes = ASL({
      baseCycles: 1,
      cross: true,
      data,
      nes,
      offsetOnCross: 1,
      acc: true,
    });

    expectNes(_nes)
      .toCycles(2)
      .toACC(0x80)
      .toStatus(1 << 6);
  });

  test("BCC, branch not occur", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1;

    const _nes = BCC({
      baseCycles: 2,
      cross: false,
      data: 2,
      nes,
      offsetOnCross: 0,
    });

    expectNes(_nes).toPC(0).toCycles(2);
  });

  test("BCC, branch occur and got to another page", () => {
    const nes = initNes();

    nes.cpu.PC = 0xff;
    nes.cpu.STATUS = 0;

    const _nes = BCC({
      baseCycles: 2,
      cross: false,
      data: 2,
      nes,
      offsetOnCross: 0,
    });

    expectNes(_nes).toPC(0x101).toCycles(5);
  });

  test("BCS, branch not occur", () => {
    const nes = initNes();

    nes.cpu.STATUS = 0;

    const _nes = BCS({
      baseCycles: 2,
      cross: false,
      data: 2,
      nes,
      offsetOnCross: 0,
    });

    expectNes(_nes).toPC(0).toCycles(2);
  });

  test("BCS, branch occur and got to another page", () => {
    const nes = initNes();

    nes.cpu.PC = 0xff;
    nes.cpu.STATUS = 1;

    const _nes = BCS({
      baseCycles: 2,
      cross: false,
      data: 2,
      nes,
      offsetOnCross: 0,
    });

    expectNes(_nes).toPC(0x101).toCycles(5);
  });

  test("BEQ, branch not occur", () => {
    const nes = initNes();

    nes.cpu.STATUS = 0;

    const _nes = BEQ({
      baseCycles: 2,
      cross: false,
      data: 2,
      nes,
      offsetOnCross: 0,
    });

    expectNes(_nes).toPC(0).toCycles(2);
  });

  test("BEQ, branch occur and got to another page", () => {
    const nes = initNes();

    nes.cpu.PC = 0xff;
    nes.cpu.STATUS = 1 << 1;

    const _nes = BEQ({
      baseCycles: 2,
      cross: false,
      data: 2,
      nes,
      offsetOnCross: 0,
    });

    expectNes(_nes).toPC(0x101).toCycles(5);
  });

  test("BIT, when the bit 6 and bit 7 are set", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;

    const _nes = BIT({
      baseCycles: 3,
      cross: false,
      data: (1 << 7) | (1 << 6),
      nes,
      offsetOnCross: 0,
    });

    expectNes(_nes)
      .toCycles(3)
      .toStatus((1 << 6) | (1 << 5))
      .toACC(0xff);
  });
  test("BIT, when zero flag to be set", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;

    const _nes = BIT({
      baseCycles: 3,
      cross: false,
      data: 0,
      nes,
      offsetOnCross: 0,
    });

    expectNes(_nes).toCycles(3).toStatus(1);
  });

  test("BMI, should not increment the PC niter add additional cycles when negative flag is clear", () => {
    const nes = initNes();
    nes.cpu.STATUS = 0;

    const _nes = BMI({
      nes,
      data: 0x0f,
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
    });

    expectNes(_nes).toCycles(2).toPC(0);
  });

  test("BMI, should increment the PC and add additional cycles when negative flag is set", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 6;

    nes.cpu.PC = 0x01f1;

    const _nes = BMI({
      nes,
      data: 0x0f,
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
    });

    expectNes(_nes).toCycles(5).toPC(0x0200);
  });

  test("BNE, should not increment the PC nether add additional cycles when zero flag is set", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 1;

    const _nes = BNE({
      nes,
      data: 0x0f,
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
    });

    expectNes(_nes).toCycles(2).toPC(0);
  });

  test("BNE, should increment the PC and add additional cycles when zero flag is clear and cross to a new page", () => {
    const nes = initNes();

    nes.cpu.STATUS = 0;

    nes.cpu.PC = 0x01f1;

    const _nes = BNE({
      nes,
      data: 0x0f,
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
    });

    expectNes(_nes).toCycles(5).toPC(0x0200);
  });
  test("BPL, should not increment the PC nether add additional cycles when negative flag is set", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 6;

    const _nes = BPL({
      nes,
      data: 0x0f,
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
    });

    expectNes(_nes).toPC(0).toCycles(2);
  });

  test("BPL, should increment the PC and add additional cycles when negative flag is clear", () => {
    const nes = initNes();

    nes.cpu.STATUS = 0;

    nes.cpu.PC = 0x01f1;

    const _nes = BPL({
      nes,
      data: 0x0f,
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
    });

    expectNes(_nes).toCycles(5).toPC(0x200);
  });

  test("BRK, should throw an error when STK overflow", () => {
    const nes = initNes();

    nes.cpu.STK = -1;

    expect(() => {
      BRK({
        nes,
        data: 0,
        baseCycles: 7,
        cross: false,
        offsetOnCross: 0,
      });
    }).toThrow("stack overflow");
  });
  test("BRK, should atl the PC to 0xfffe/f and put the old PC and status to the stack", () => {
    const nes = initNes();

    nes.cpu.STK = 0xff;

    nes.cpu.STATUS = 1;

    nes.cpu.PC = 2;

    const _nes = BRK({
      nes,
      data: 0,
      baseCycles: 7,
      cross: false,
      offsetOnCross: 0,
    });

    expectNes(_nes)
      .toSTK(0xfd)
      .toBuss(0x01ff, 2)
      .toBuss(0x01fe, 1)
      .toPC(0xfffe)
      .toCycles(7)
      .toStatus((1 << 4) | 1);
  });

  test("BVC, should not branch if overflow is set", () => {
    const nes = initNes();

    nes.cpu.PC = 0x00;

    nes.cpu.STATUS = 1 << 5;

    const _nes = BVC({
      nes,
      cross: false,
      baseCycles: 2,
      data: 0xff,
      offsetOnCross: 0,
    });

    expectNes(_nes).toCycles(2).toPC(0);
  });
  test("BVC, should branch when overflow is clear", () => {
    const nes = initNes();

    nes.cpu.PC = 0x01f1;

    nes.cpu.STATUS = 0;

    const _nes = BVC({
      nes,
      cross: false,
      baseCycles: 2,
      data: 0x0f,
      offsetOnCross: 0,
    });

    expectNes(_nes).toCycles(5).toPC(0x0200);
  });

  test("BVS, should not branch if overflow is clear", () => {
    const nes = initNes();

    nes.cpu.PC = 0x00;

    nes.cpu.STATUS = 0;

    const _nes = BVS({
      nes,
      cross: false,
      baseCycles: 2,
      data: 0xff,
      offsetOnCross: 0,
    });

    expectNes(_nes).toCycles(2).toPC(0);
  });
  test("BVS, should branch when overflow is set", () => {
    const nes = initNes();

    nes.cpu.PC = 0x01f1;

    nes.cpu.STATUS = 1 << 5;

    const _nes = BVS({
      nes,
      cross: false,
      baseCycles: 2,
      data: 0x0f,
      offsetOnCross: 0,
    });

    expectNes(_nes).toCycles(5).toPC(0x0200);
  });

  test("CLC, should clear the carry flag", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1;

    const _nes = CLC({
      baseCycles: 2,
      cross: false,
      data: 0,
      nes,
      offsetOnCross: 0,
    });

    expectNes(_nes).toCycles(2).toStatus(0);
  });

  test("CLD, should clear decimal mode", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 3;

    const _nes = CLD({
      baseCycles: 2,
      cross: false,
      data: 0,
      nes,
      offsetOnCross: 0,
    });

    expectNes(_nes).toStatus(0).toCycles(2);
  });

  test("CLI, should clear interrupt disable", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 2;

    const _nes = CLI({
      baseCycles: 2,
      cross: false,
      data: 0,
      nes,
      offsetOnCross: 0,
    });

    expectNes(_nes).toStatus(0).toCycles(2);
  });

  test("CLV, should clear overflow", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 5;

    const _nes = CLV({
      baseCycles: 2,
      cross: false,
      data: 0,
      nes,
      offsetOnCross: 0,
    });

    expectNes(_nes).toCycles(2).toStatus(0);
  });

  test("CMP, should set carry flag if ACC >== memory", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x0f;
    const data = 0x0e;

    const _nes = CMP({
      baseCycles: 3,
      cross: true,
      offsetOnCross: 2,
      data,
      nes,
    });
    expectNes(_nes).toCycles(5).toStatus(1);
  });
  test("CMP, should set zero flag if ACC === memory", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x0f;
    const data = 0x0f;

    const _nes = CMP({
      baseCycles: 3,
      cross: true,
      offsetOnCross: 2,
      data,
      nes,
    });

    expectNes(_nes)
      .toStatus((1 << 1) | 1)
      .toCycles(5);
  });
  test("CMP, should negative flag if the result was negative", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x0e;
    const data = 0x0f;

    const _nes = CMP({
      baseCycles: 3,
      cross: true,
      offsetOnCross: 2,
      data,
      nes,
    });

    expectNes(_nes)
      .toStatus(1 << 6)
      .toCycles(5);
  });

  test("CPX, should set carry flag if X >= memory", () => {
    const nes = initNes();
    nes.cpu.X = 0x0e;
    const data = 0x0d;
    const _nes = CPX({
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });

    expectNes(_nes).toCycles(2).toStatus(1);
  });

  test("CPX, should set zero flag if X === memory", () => {
    const nes = initNes();
    nes.cpu.X = 0x0e;
    const data = 0x0e;
    const _nes = CPX({
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });

    expectNes(_nes)
      .toCycles(2)
      .toStatus((1 << 1) | 1);
  });

  test("CPX, should set negative flag if the result was negative", () => {
    const nes = initNes();
    nes.cpu.X = 0xfe;
    const data = 0x0e;
    const _nes = CPX({
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });

    expectNes(_nes)
      .toStatus(1 << 6)
      .toCycles(2);
  });

  test("CPY, should set carry flag when Y >= memory", () => {
    const nes = initNes();

    nes.cpu.Y = 0x0f;
    const data = 0x0e;

    const _nes = CPY({
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });

    expectNes(_nes).toCycles(2).toStatus(1);
  });

  test("CPY, should set zero flag when Y == memory", () => {
    const nes = initNes();

    nes.cpu.Y = 0xfe;
    const data = 0xfe;

    const _nes = CPY({
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });

    expectNes(_nes)
      .toCycles(2)
      .toStatus((1 << 1) | 1);
  });

  test("CPY, should set negative flag when the result was negative", () => {
    const nes = initNes();

    nes.cpu.Y = 0xff;
    const data = 0x0e;

    const _nes = CPY({
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });

    expectNes(_nes)
      .toStatus(1 << 6)
      .toCycles(2);
  });
  test("DEC, should decrement memory and ser zero flag when memory = 1", () => {
    const nes = initNes();

    nes.bus[0].data = 0x01;

    const data = 0x00;

    const _nes = DEC({
      baseCycles: 5,
      cross: false,
      data,
      addr: 0,
      nes,
      offsetOnCross: 0,
    });

    expectNes(_nes)
      .toCycles(5)
      .toStatus(1 << 1)
      .toBuss(0, 0);
  });

  test("DEC, should decrement memory and set negative flag when memory = 0", () => {
    const nes = initNes();

    nes.bus[0].data = 0x00;

    const data = 0x00;

    const _nes = DEC({
      baseCycles: 5,
      cross: false,
      data,
      nes,
      offsetOnCross: 0,
      addr: 0,
    });

    expectNes(_nes)
      .toCycles(5)
      .toStatus(1 << 6)
      .toBuss(0, 0xff);
  });
  test("DEX, decrement X to zero", () => {
    const nes = initNes();

    nes.cpu.X = 1;

    const data = 0x00;

    const _nes = DEX({
      baseCycles: 2,
      cross: false,
      data,
      nes,
      offsetOnCross: 0,
    });

    expectNes(_nes)
      .toCycles(2)
      .toX(0)
      .toStatus(1 << 1);
  });

  test("DEX, decrement X to 0xff", () => {
    const nes = initNes();

    nes.cpu.X = 0;

    const data = 0x00;

    const _nes = DEX({
      baseCycles: 2,
      cross: false,
      data,
      nes,
      offsetOnCross: 0,
    });

    expectNes(_nes)
      .toCycles(2)
      .toX(0xff)
      .toStatus(1 << 6);
  });

  test("DEY, decrement Y to zero", () => {
    const nes = initNes();

    nes.cpu.Y = 1;

    const data = 0x00;

    const _nes = DEY({
      baseCycles: 2,
      cross: false,
      data,
      nes,
      offsetOnCross: 0,
    });

    expectNes(_nes)
      .toCycles(2)
      .toY(0)
      .toStatus(1 << 1);
  });

  test("DEY, decrement Y to 0xff", () => {
    const nes = initNes();

    nes.cpu.Y = 0;

    const data = 0x00;

    const _nes = DEY({
      baseCycles: 2,
      cross: false,
      data,
      nes,
      offsetOnCross: 0,
    });

    expectNes(_nes)
      .toCycles(2)
      .toY(0xff)
      .toStatus(1 << 6);
  });

  test("EOR, should result in zero when ACC = 0xff and M = 0xff, set the zero flag and cross page", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;
    const data = 0xff;

    const _nes = EOR({
      baseCycles: 4,
      cross: true,
      data,
      nes,
      offsetOnCross: 1,
    });

    expectNes(_nes)
      .toCycles(5)
      .toACC(0)
      .toStatus(1 << 1);
  });
  test("EOR, should result in negative when ACC = 0xff and M = 0x00, set the zero flag and cross page", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;
    const data = 0x00;

    const _nes = EOR({
      baseCycles: 4,
      cross: true,
      data,
      nes,
      offsetOnCross: 1,
    });

    expectNes(_nes)
      .toCycles(5)
      .toACC(0xff)
      .toStatus(1 << 6);
  });

  test("INC, increment memory when value is 0xff and zero flag going to be set", () => {
    const _nes = initNes();

    _nes.bus[0x01].data = 0xff;

    const data = 0x01;

    const nes = INC({
      baseCycles: 5,
      cross: true,
      offsetOnCross: 0,
      data,
      nes: _nes,
      addr: 0x01,
    });

    expectNes(nes)
      .toCycles(5)
      .toStatus(1 << 1)
      .toBuss(0x01, 0);
  });
  test("INC, increment memory when value is 0x7f and negative flag is set resulting in 0x80", () => {
    const nes = initNes();

    nes.bus[0x01].data = 0x7f;

    const data = 0x01;

    const _nes = INC({
      baseCycles: 5,
      cross: true,
      offsetOnCross: 0,
      data,
      nes,
      addr: 0x01,
    });

    expectNes(_nes)
      .toCycles(5)
      .toStatus(1 << 6)
      .toBuss(0x01, 0x80);
  });

  test("INX, increment X and set de Zero Flag", () => {
    const nes = initNes();

    nes.cpu.X = 0xff;

    const data = 0x00;

    const _nes = INX({
      baseCycles: 5,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });

    expectNes(_nes)
      .toCycles(5)
      .toStatus(1 << 1)
      .toX(0);
  });

  test("INX, increment X and set de Negative Flag", () => {
    const nes = initNes();

    nes.cpu.X = 0x7f;

    const data = 0x00;

    const _nes = INX({
      baseCycles: 5,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });

    expectNes(_nes)
      .toCycles(5)
      .toStatus(1 << 6)
      .toX(0x80);
  });

  test("INY, increment Y and set de Zero Flag", () => {
    const nes = initNes();

    nes.cpu.Y = 0xff;

    const data = 0x00;

    const _nes = INY({
      baseCycles: 5,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });

    expectNes(_nes)
      .toCycles(5)
      .toStatus(1 << 1)
      .toY(0);
  });

  test("INY, increment Y and set de Negative Flag", () => {
    const nes = initNes();

    nes.cpu.Y = 0x7f;

    const data = 0x00;

    const _nes = INY({
      baseCycles: 5,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });

    expectNes(_nes)
      .toCycles(5)
      .toStatus(1 << 6)
      .toY(0x80);
  });

  test("JMP", () => {
    const nes = initNes();

    const data = 0x1234;

    const _nes = JMP({
      baseCycles: 5,
      cross: true,
      offsetOnCross: 0,
      data,
      nes,
    });

    expectNes(_nes).toPC(0x1234).toCycles(5);
  });

  test("JSR", () => {
    const nes = initNes();

    nes.cpu.PC = 3;

    const data = 0x1234;

    const _nes = JSR({
      baseCycles: 5,
      cross: true,
      offsetOnCross: 0,
      data,
      nes,
    });

    expectNes(_nes).toCycles(5).toPC(0x1234).toBuss(0x01ff, 2);
  });

  test("LDA, load the ACC a zero number", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;

    const data = 0x00;

    const _nes = LDA({
      baseCycles: 6,
      cross: true,
      offsetOnCross: 1,
      nes,
      data,
    });

    expectNes(_nes)
      .toCycles(7)
      .toStatus(1 << 1)
      .toACC(0);
  });

  test("LDA, load the ACC a negative number", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x00;

    const data = 0x80;

    const _nes = LDA({
      baseCycles: 6,
      cross: true,
      offsetOnCross: 1,
      nes,
      data,
    });

    expectNes(_nes)
      .toStatus(1 << 6)
      .toCycles(7)
      .toACC(0x80);
  });

  test("LDX, load X a zero number", () => {
    const nes = initNes();

    nes.cpu.X = 0x01;

    const data = 0x00;

    const _nes = LDX({
      baseCycles: 4,
      cross: true,
      offsetOnCross: 1,
      nes,
      data,
    });

    expectNes(_nes)
      .toCycles(5)
      .toStatus(1 << 1)
      .toX(0x00);
  });

  test("LDX, load X a negative number", () => {
    const nes = initNes();

    nes.cpu.X = 0x00;

    const data = 0x80;

    const _nes = LDX({
      baseCycles: 4,
      cross: true,
      offsetOnCross: 1,
      nes,
      data,
    });

    expectNes(_nes)
      .toCycles(5)
      .toStatus(1 << 6)
      .toX(0x80);
  });

  test("LDY, load Y a zero number", () => {
    const nes = initNes();

    nes.cpu.Y = 0x01;

    const data = 0x00;

    const _nes = LDY({
      baseCycles: 4,
      cross: true,
      offsetOnCross: 1,
      nes,
      data,
    });

    expectNes(_nes)
      .toCycles(5)
      .toStatus(1 << 1)
      .toY(0x00);
  });

  test("LDY, load Y a negative number", () => {
    const nes = initNes();

    nes.cpu.Y = 0x00;

    const data = 0x80;

    const _nes = LDY({
      baseCycles: 4,
      cross: true,
      offsetOnCross: 1,
      nes,
      data,
    });

    expectNes(_nes)
      .toCycles(5)
      .toStatus(1 << 6)
      .toY(0x80);
  });

  test("LSR, shift right on the accumulator carry flag is set and zero flag is set to", () => {
    const nes = initNes();

    const data = 0x01;

    const _nes = LSR({
      baseCycles: 6,
      data,
      cross: false,
      offsetOnCross: 0,
      nes,
      acc: true,
    });

    expectNes(_nes)
      .toCycles(6)
      .toStatus((1 << 1) | 1)
      .toACC(0);
  });

  test("LSR, shift right on the memory ", () => {
    const nes = initNes();

    const data = 0x02;

    const _nes = LSR({
      baseCycles: 6,
      data,
      cross: false,
      offsetOnCross: 0,
      nes,
      addr: 0x00,
    });

    expectNes(_nes).toCycles(6).toStatus(0).toBuss(0x00, 0x01);
  });

  test("NOP", () => {
    const nes = initNes();

    const _nes = NOP({
      baseCycles: 6,
      data: 0,
      cross: false,
      offsetOnCross: 0,
      nes,
    });

    expectNes(_nes).toCycles(6);
  });

  test("ORA, when zero flag", () => {
    const nes = initNes();

    nes.cpu.ACC = 0;

    const _nes = ORA({
      baseCycles: 5,
      data: 0x00,
      cross: true,
      offsetOnCross: 1,
      nes,
    });

    expectNes(_nes)
      .toCycles(6)
      .toACC(0)
      .toStatus(1 << 1);
  });

  test("ORA, when negative flag", () => {
    const nes = initNes();

    nes.cpu.ACC = 1 << 7;

    const _nes = ORA({
      baseCycles: 5,
      data: 1 << 6,
      cross: true,
      offsetOnCross: 1,
      nes,
    });

    expectNes(_nes)
      .toCycles(6)
      .toACC((1 << 7) | (1 << 6))
      .toStatus(1 << 6);
  });

  test("PHA, push a copy of the ACC to the stack", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x12;

    const _nes = PHA({
      baseCycles: 3,
      nes,
    } as InstructionData);

    expectNes(_nes).toCycles(3).toSTK(0xfe).toBuss(0x01ff, 0x12);
  });

  test("PHP, Push Processor Status", () => {
    const nes = initNes();

    nes.cpu.STATUS = 0x12;

    const { nes: _nes, totalCycle } = PHP({
      baseCycles: 3,
      nes,
    } as InstructionData);

    expect(totalCycle).toBe(3);

    expect(_nes.cpu.STK).toBe(0xfe);
    expect(_nes.bus[0x01ff].data).toBe(0x12);
  });

  test("PLA, pull accumulator a zero value", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;
    nes.cpu.STK = 0xfe;
    nes.bus[0x01ff].data = 0x00;

    const { nes: _nes, totalCycle } = PLA({
      baseCycles: 4,
      nes,
    } as InstructionData);

    expect(totalCycle).toBe(4);

    expect(_nes.cpu.ACC).toBe(0);
    expect(_nes.cpu.STK).toBe(0xff);
    expect(_nes.cpu.STATUS).toBe(1 << 1);
  });
  test("PLA, pull accumulator a negative value", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x0f;
    nes.cpu.STK = 0xfe;
    nes.bus[0x01ff].data = 0xf0;

    const { nes: _nes, totalCycle } = PLA({
      baseCycles: 4,
      nes,
    } as InstructionData);

    expect(totalCycle).toBe(4);

    expect(_nes.cpu.ACC).toBe(0xf0);
    expect(_nes.cpu.STK).toBe(0xff);
    expect(_nes.cpu.STATUS).toBe(1 << 6);
  });
  test("PLP, pull process Status", () => {
    const nes = initNes();

    nes.cpu.STATUS = 0x00;
    nes.cpu.STK = 0xfe;
    nes.bus[0x01ff].data = 0x12;

    const { nes: _nes, totalCycle } = PLP({
      baseCycles: 4,
      nes,
    } as InstructionData);

    expect(totalCycle).toBe(4);

    expect(_nes.cpu.STATUS).toBe(0x12);
    expect(_nes.cpu.STK).toBe(0xff);
  });

  test("ROL, rotate left the accumulator when value is 1000-0000 binary carry flag is set", () => {
    const nes = initNes();

    const data = 1 << 7;

    const { totalCycle, nes: _nes } = ROL({
      baseCycles: 2,
      nes,
      data,
      acc: true,
    } as InstructionData);

    const { cpu } = _nes;

    expect(totalCycle).toBe(2);

    expect(cpu.ACC).toBe(1);

    expect(cpu.STATUS).toBe(1);
  });
  test("ROL, rotate left the memory when value is 0100-0000 binary negative flag is set", () => {
    const nes = initNes();

    const data = 1 << 6;

    const { nes: _nes, totalCycle } = ROL({
      baseCycles: 2,
      nes,
      data,
      addr: 0x0000,
    } as InstructionData);

    const { cpu, bus } = _nes;

    expect(totalCycle).toBe(2);

    expect(bus[0x0000].data).toBe(1 << 7);

    expect(cpu.STATUS).toBe(1 << 6);
  });

  test("ROL, rotate left the accumulator when value is 0x00 zero flag is set", () => {
    const nes = initNes();

    const data = 0;

    const { nes: _nes, totalCycle } = ROL({
      baseCycles: 2,
      nes,
      data,
      acc: true,
    } as InstructionData);

    const { cpu } = _nes;

    expect(totalCycle).toBe(2);

    expect(cpu.ACC).toBe(0);

    expect(cpu.STATUS).toBe(1 << 1);
  });

  test("ROR, rotate right the accumulator when value is 0x01 then cary flag and negative flag are set", () => {
    const nes = initNes();

    const data = 0x01;

    const { nes: _nes, totalCycle } = ROR({
      baseCycles: 2,
      nes,
      data,
      acc: true,
    } as InstructionData);

    const { cpu } = _nes;

    expect(totalCycle).toBe(2);

    expect(cpu.ACC).toBe(1 << 7);

    expect(cpu.STATUS).toBe((1 << 6) | 1);
  });

  test("ROR, rotate right the memory when value is 0x00 then zero flag are set", () => {
    const nes = initNes();

    nes.bus[0].data = 0x01;

    const data = 0x00;

    const { nes: _nes, totalCycle } = ROR({
      baseCycles: 2,
      nes,
      data,
      addr: 0x00,
    } as InstructionData);

    const { cpu, bus } = _nes;

    expect(totalCycle).toBe(2);

    expect(bus[0].data).toBe(0x00);

    expect(cpu.STATUS).toBe(1 << 1);
  });
});
