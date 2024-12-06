import {
  Bus,
  readBusNes,
  simpleRead,
  simpleWrite,
  writeBusNes,
} from "@/nes/bus/bus";
import { Nes } from "@/nes/nes";
import { Cpu, getPC, getZeroFlag, setPC } from "../cpu";
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
  Instruction,
  PHA,
  PHP,
  PLA,
  PLP,
  ROL,
  ROR,
  RTI,
  RTS,
  SBC,
  SEC,
  SED,
  SEI,
  STA,
  STX,
  STY,
  TAX,
  TAY,
  TSX,
  TXA,
  TXS,
  TYA,
  NMI,
  pushPCStack,
  pullPCStack,
  pushToStack,
} from "./instruction";
import { initPpu } from "@/nes/ppu/ppu";
import { initBanks } from "@/nes/banks/bank";
import { repeat } from "@/nes/helper/repeat";
import { write } from "fs";
import { initInterrupt } from "../interrupt/interrupt";

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
  interrupt: initInterrupt(),
});

const initNes = (): Nes => ({
  bus: initBus(),
  cpu: initCpu(),
  ppu: initPpu(),
  banks: initBanks(),
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

const encodeStatus = (status: number) => {
  return "czidbvn"
    .split("")
    .map((v, i) => ((status >> i) & 1 ? v.toUpperCase() : v))
    .join("");
};

const toEncodeStatus = (nes: Nes) => (encode: string) => {
  expect(encodeStatus(nes.cpu.STATUS)).toBe(encode);

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
    toEncodeStatus: toEncodeStatus(nes),
  };
}

describe("instruction test", () => {
  test("ADC,  when carry flag, zero flag is set", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;
    const _nes = ADC({
      data: 0x01,
      nes,
    });

    expectNes(_nes)
      .toACC(0x00)
      .toStatus((1 << 1) | 1);
  });
  test("ADC,  when negative flag is set", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;
    const _nes = ADC({
      data: 0x00,
      nes,
    });

    expectNes(_nes)
      .toStatus(1 << 6)

      .toACC(0xff);
  });
  test("ADC, when overflow is set", () => {
    const nes = initNes();
    nes.cpu.ACC = 64;
    const data = 64;

    const _nes = ADC({
      data,
      nes,
    });

    expectNes(_nes)
      .toACC(128)
      .toStatus((1 << 6) | (1 << 5));
  });

  test("AND, when result is zero", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x00;

    const data = 0xff;

    const _nes = AND({
      nes,
      data,
    });

    expectNes(_nes)
      .toACC(0x00)
      .toStatus(1 << 1);
  });

  test("AND, when result is negative", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xf0;

    const data = 0xa0;

    const _nes = AND({
      nes,
      data,
    });

    expectNes(_nes)
      .toACC(0xa0)
      .toStatus(1 << 6);
  });

  test("ASL, carry flag and zero flag is set on memory operator", () => {
    const nes = initNes();

    const addr = 0x0000;

    const data = 1 << 7;

    nes.bus[addr].data = data;

    const _nes = ASL({
      data,
      nes,

      addr,
    });

    expectNes(_nes)
      .toBuss(addr, 0)
      .toStatus((1 << 1) | 1);
  });

  test("ASL, negative is set on acc operation on memory operator", () => {
    const nes = initNes();

    const addr = 0x0000;

    const data = 1 << 6;

    nes.bus[addr].data = data;

    const _nes = ASL({
      data,
      nes,

      addr,
    });

    expectNes(_nes)
      .toStatus(1 << 6)
      .toBuss(addr, 1 << 7);
  });

  test("ASL, when cary flag and zero flag is set on accumulator operator", () => {
    const nes = initNes();
    const data = 0x80;

    const _nes = ASL({
      data,
      nes,

      acc: true,
    });

    expectNes(_nes)
      .toStatus((1 << 1) | 1)
      .toACC(0x00);
  });

  test("ASL, when negative is set on acc operation", () => {
    const nes = initNes();
    const data = 0x40;

    const _nes = ASL({
      data,
      nes,

      acc: true,
    });

    expectNes(_nes)
      .toACC(0x80)
      .toStatus(1 << 6);
  });

  test("BCC, branch not occur", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1;

    const _nes = BCC({
      data: 2,
      nes,
    });

    expectNes(_nes).toPC(0);
  });

  test("BCC, branch occur and got to another page", () => {
    const nes = initNes();

    nes.cpu.PC = 0xff;
    nes.cpu.STATUS = 0;

    const _nes = BCC({
      data: 2,
      nes,
    });

    expectNes(_nes).toPC(0x101);
  });

  test("BCS, branch not occur", () => {
    const nes = initNes();

    nes.cpu.STATUS = 0;

    const _nes = BCS({
      data: 2,
      nes,
    });

    expectNes(_nes).toPC(0);
  });

  test("BCS, branch occur and got to another page", () => {
    const nes = initNes();

    nes.cpu.PC = 0xff;
    nes.cpu.STATUS = 1;

    const _nes = BCS({
      data: 2,
      nes,
    });

    expectNes(_nes).toPC(0x101);
  });

  test("BEQ, branch not occur", () => {
    const nes = initNes();

    nes.cpu.STATUS = 0;

    const _nes = BEQ({
      data: 2,
      nes,
    });

    expectNes(_nes).toPC(0);
  });

  test("BEQ, branch occur and got to another page", () => {
    const nes = initNes();

    nes.cpu.PC = 0xff;
    nes.cpu.STATUS = 1 << 1;

    const _nes = BEQ({
      data: 2,
      nes,
    });

    expectNes(_nes).toPC(0x101);
  });

  test("BIT, when the bit 6 and bit 7 are set", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;

    const _nes = BIT({
      data: (1 << 7) | (1 << 6),
      nes,
    });

    expectNes(_nes)
      .toStatus((1 << 6) | (1 << 5))
      .toACC(0xff);
  });
  test("BIT, when zero flag to be set", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;

    const _nes = BIT({
      data: 0,
      nes,
    });

    expectNes(_nes).toStatus(1);
  });

  test("BMI, should not increment the PC niter add additional cycles when negative flag is clear", () => {
    const nes = initNes();
    nes.cpu.STATUS = 0;

    const _nes = BMI({
      nes,
      data: 0x0f,
    });

    expectNes(_nes).toPC(0);
  });

  test("BMI, should increment the PC and add additional cycles when negative flag is set", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 6;

    nes.cpu.PC = 0x01f1;

    const _nes = BMI({
      nes,
      data: 0x0f,
    });

    expectNes(_nes).toPC(0x0200);
  });

  test("BNE, should not increment the PC nether add additional cycles when zero flag is set", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 1;

    const _nes = BNE({
      nes,
      data: 0x0f,
    });

    expectNes(_nes).toPC(0);
  });

  test("BNE, should increment the PC and add additional cycles when zero flag is clear and cross to a new page", () => {
    const nes = initNes();

    nes.cpu.STATUS = 0;

    nes.cpu.PC = 0x01f1;

    const _nes = BNE({
      nes,
      data: 0x0f,
    });

    expectNes(_nes).toPC(0x0200);
  });
  test("BPL, should not increment the PC nether add additional cycles when negative flag is set", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 6;

    const _nes = BPL({
      nes,
      data: 0x0f,
    });

    expectNes(_nes).toPC(0);
  });

  test("BPL, should increment the PC and add additional cycles when negative flag is clear", () => {
    const nes = initNes();

    nes.cpu.STATUS = 0;

    nes.cpu.PC = 0x01f1;

    const _nes = BPL({
      nes,
      data: 0x0f,
    });

    expectNes(_nes).toPC(0x200);
  });

  test("BRK, should throw an error when STK overflow", () => {
    const nes = initNes();

    nes.cpu.STK = -1;

    expect(() => {
      BRK({
        nes,
        data: 0,
      });
    }).toThrow("stack overflow");
  });
  test("BRK, should atl the PC to 0xfffe/f and put the old PC and status to the stack", () => {
    const nes = initNes();

    nes.cpu.STK = 0xff;

    nes.cpu.STATUS = 1;

    nes.cpu.PC = 0x1234;

    const _nes = BRK({
      nes,
      data: 0,
    });

    expectNes(_nes)
      .toSTK(0xfc)
      .toBuss(0x01ff, 0x12)
      .toBuss(0x01fe, 0x34)
      .toBuss(0x01fd, 1)

      .toPC(0x1234)
      .toStatus((1 << 4) | 1);
  });

  test("BVC, should not branch if overflow is set", () => {
    const nes = initNes();

    nes.cpu.PC = 0x00;

    nes.cpu.STATUS = 1 << 5;

    const _nes = BVC({
      nes,

      data: 0xff,
    });

    expectNes(_nes).toPC(0);
  });
  test("BVC, should branch when overflow is clear", () => {
    const nes = initNes();

    nes.cpu.PC = 0x01f1;

    nes.cpu.STATUS = 0;

    const _nes = BVC({
      nes,

      data: 0x0f,
    });

    expectNes(_nes).toPC(0x0200);
  });

  test("BVS, should not branch if overflow is clear", () => {
    const nes = initNes();

    nes.cpu.PC = 0x00;

    nes.cpu.STATUS = 0;

    const _nes = BVS({
      nes,

      data: 0xff,
    });

    expectNes(_nes).toPC(0);
  });
  test("BVS, should branch when overflow is set", () => {
    const nes = initNes();

    nes.cpu.PC = 0x01f1;

    nes.cpu.STATUS = 1 << 5;

    const _nes = BVS({
      nes,

      data: 0x0f,
    });

    expectNes(_nes).toPC(0x0200);
  });

  test("CLC, should clear the carry flag", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1;

    const _nes = CLC({
      data: 0,
      nes,
    });

    expectNes(_nes).toStatus(0);
  });

  test("CLD, should clear decimal mode", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 3;

    const _nes = CLD({
      data: 0,
      nes,
    });

    expectNes(_nes).toStatus(0);
  });

  test("CLI, should clear interrupt disable", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 2;

    const _nes = CLI({
      data: 0,
      nes,
    });

    expectNes(_nes).toStatus(0);
  });

  test("CLV, should clear overflow", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 5;

    const _nes = CLV({
      data: 0,
      nes,
    });

    expectNes(_nes).toStatus(0);
  });

  test("CMP, should set carry flag if ACC >== memory", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x0f;
    const data = 0x0e;

    const _nes = CMP({
      data,
      nes,
    });
    expectNes(_nes).toStatus(1);
  });
  test("CMP, should set zero flag if ACC === memory", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x0f;
    const data = 0x0f;

    const _nes = CMP({
      data,
      nes,
    });

    expectNes(_nes).toStatus((1 << 1) | 1);
  });
  test("CMP, should negative flag if the result was negative", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x0e;
    const data = 0x0f;

    const _nes = CMP({
      data,
      nes,
    });

    expectNes(_nes).toStatus(1 << 6);
  });

  test("CPX, should set carry flag if X >= memory", () => {
    const nes = initNes();
    nes.cpu.X = 0x0e;
    const data = 0x0d;
    const _nes = CPX({
      data,
      nes,
    });

    expectNes(_nes).toStatus(1);
  });

  test("CPX, should set zero flag if X === memory", () => {
    const nes = initNes();
    nes.cpu.X = 0x0e;
    const data = 0x0e;
    const _nes = CPX({
      data,
      nes,
    });

    expectNes(_nes).toStatus((1 << 1) | 1);
  });

  test("CPX, should set negative flag if the result was negative", () => {
    const nes = initNes();
    nes.cpu.X = 0xfe;
    const data = 0x0e;
    const _nes = CPX({
      data,
      nes,
    });

    expectNes(_nes).toStatus(1 << 6);
  });

  test("CPY, should set carry flag when Y >= memory", () => {
    const nes = initNes();

    nes.cpu.Y = 0x0f;
    const data = 0x0e;

    const _nes = CPY({
      data,
      nes,
    });

    expectNes(_nes).toStatus(1);
  });

  test("CPY, should set zero flag when Y == memory", () => {
    const nes = initNes();

    nes.cpu.Y = 0xfe;
    const data = 0xfe;

    const _nes = CPY({
      data,
      nes,
    });

    expectNes(_nes).toStatus((1 << 1) | 1);
  });

  test("CPY, should set negative flag when the result was negative", () => {
    const nes = initNes();

    nes.cpu.Y = 0xff;
    const data = 0x0e;

    const _nes = CPY({
      data,
      nes,
    });

    expectNes(_nes).toStatus(1 << 6);
  });
  test("DEC, should decrement memory and ser zero flag when memory = 1", () => {
    const nes = initNes();

    nes.bus[0].data = 0x01;

    const data = 0x00;

    const _nes = DEC({
      data,
      addr: 0,
      nes,
    });

    expectNes(_nes)
      .toStatus(1 << 1)
      .toBuss(0, 0);
  });

  test("DEC, should decrement memory and set negative flag when memory = 0", () => {
    const nes = initNes();

    nes.bus[0].data = 0x00;

    const data = 0x00;

    const _nes = DEC({
      data,
      nes,

      addr: 0,
    });

    expectNes(_nes)
      .toStatus(1 << 6)
      .toBuss(0, 0xff);
  });
  test("DEX, decrement X to zero", () => {
    const nes = initNes();

    nes.cpu.X = 1;

    const data = 0x00;

    const _nes = DEX({
      data,
      nes,
    });

    expectNes(_nes)
      .toX(0)
      .toStatus(1 << 1);
  });

  test("DEX, decrement X to 0xff", () => {
    const nes = initNes();

    nes.cpu.X = 0;

    const data = 0x00;

    const _nes = DEX({
      data,
      nes,
    });

    expectNes(_nes)
      .toX(0xff)
      .toStatus(1 << 6);
  });

  test("DEY, decrement Y to zero", () => {
    const nes = initNes();

    nes.cpu.Y = 1;

    const data = 0x00;

    const _nes = DEY({
      data,
      nes,
    });

    expectNes(_nes)
      .toY(0)
      .toStatus(1 << 1);
  });

  test("DEY, decrement Y to 0xff", () => {
    const nes = initNes();

    nes.cpu.Y = 0;

    const data = 0x00;

    const _nes = DEY({
      data,
      nes,
    });

    expectNes(_nes)
      .toY(0xff)
      .toStatus(1 << 6);
  });

  test("EOR, should result in zero when ACC = 0xff and M = 0xff, set the zero flag and cross page", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;
    const data = 0xff;

    const _nes = EOR({
      data,
      nes,
    });

    expectNes(_nes)
      .toACC(0)
      .toStatus(1 << 1);
  });
  test("EOR, should result in negative when ACC = 0xff and M = 0x00, set the zero flag and cross page", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;
    const data = 0x00;

    const _nes = EOR({
      data,
      nes,
    });

    expectNes(_nes)
      .toACC(0xff)
      .toStatus(1 << 6);
  });

  test("INC, increment memory when value is 0xff and zero flag going to be set", () => {
    const _nes = initNes();

    _nes.bus[0x01].data = 0xff;

    const data = 0x01;

    const nes = INC({
      data,
      nes: _nes,
      addr: 0x01,
    });

    expectNes(nes)
      .toStatus(1 << 1)
      .toBuss(0x01, 0);
  });
  test("INC, increment memory when value is 0x7f and negative flag is set resulting in 0x80", () => {
    const nes = initNes();

    nes.bus[0x01].data = 0x7f;

    const data = 0x01;

    const _nes = INC({
      data,
      nes,
      addr: 0x01,
    });

    expectNes(_nes)
      .toStatus(1 << 6)
      .toBuss(0x01, 0x80);
  });

  test("INX, increment X and set de Zero Flag", () => {
    const nes = initNes();

    nes.cpu.X = 0xff;

    const data = 0x00;

    const _nes = INX({
      data,
      nes,
    });

    expectNes(_nes)
      .toStatus(1 << 1)
      .toX(0);
  });

  test("INX, increment X and set de Negative Flag", () => {
    const nes = initNes();

    nes.cpu.X = 0x7f;

    const data = 0x00;

    const _nes = INX({
      data,
      nes,
    });

    expectNes(_nes)
      .toStatus(1 << 6)
      .toX(0x80);
  });

  test("INY, increment Y and set de Zero Flag", () => {
    const nes = initNes();

    nes.cpu.Y = 0xff;

    const data = 0x00;

    const _nes = INY({
      data,
      nes,
    });

    expectNes(_nes)
      .toStatus(1 << 1)
      .toY(0);
  });

  test("INY, increment Y and set de Negative Flag", () => {
    const nes = initNes();

    nes.cpu.Y = 0x7f;

    const data = 0x00;

    const _nes = INY({
      data,
      nes,
    });

    expectNes(_nes)
      .toStatus(1 << 6)
      .toY(0x80);
  });

  test("JMP", () => {
    const nes = initNes();

    const data = 0x1234;

    const _nes = JMP({
      data,
      addr: data,
      nes,
    });

    expectNes(_nes).toPC(0x1234);
  });

  test("JSR", () => {
    const nes = initNes();

    nes.cpu.PC = 0x1234;

    const addr = 0x1234;

    const _nes = JSR({
      data: 0,
      addr,
      nes,
    });

    expectNes(_nes).toPC(0x1234).toBuss(0x01ff, 0x12).toBuss(0x01fe, 0x33);
  });

  test("LDA, load the ACC a zero number", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;

    const data = 0x00;

    const _nes = LDA({
      nes,
      data,
    });

    expectNes(_nes)
      .toStatus(1 << 1)
      .toACC(0);
  });

  test("LDA, load the ACC a negative number", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x00;

    const data = 0x80;

    const _nes = LDA({
      nes,
      data,
    });

    expectNes(_nes)
      .toStatus(1 << 6)

      .toACC(0x80);
  });

  test("LDX, load X a zero number", () => {
    const nes = initNes();

    nes.cpu.X = 0x01;

    const data = 0x00;

    const _nes = LDX({
      nes,
      data,
    });

    expectNes(_nes)
      .toStatus(1 << 1)
      .toX(0x00);
  });

  test("LDX, load X a negative number", () => {
    const nes = initNes();

    nes.cpu.X = 0x00;

    const data = 0x80;

    const _nes = LDX({
      nes,
      data,
    });

    expectNes(_nes)
      .toStatus(1 << 6)
      .toX(0x80);
  });

  test("LDY, load Y a zero number", () => {
    const nes = initNes();

    nes.cpu.Y = 0x01;

    const data = 0x00;

    const _nes = LDY({
      nes,
      data,
    });

    expectNes(_nes)
      .toStatus(1 << 1)
      .toY(0x00);
  });

  test("LDY, load Y a negative number", () => {
    const nes = initNes();

    nes.cpu.Y = 0x00;

    const data = 0x80;

    const _nes = LDY({
      nes,
      data,
    });

    expectNes(_nes)
      .toStatus(1 << 6)
      .toY(0x80);
  });

  test("LSR, shift right on the accumulator carry flag is set and zero flag is set to", () => {
    const nes = initNes();

    const data = 0x01;

    const _nes = LSR({
      data,

      nes,
      acc: true,
    });

    expectNes(_nes)
      .toStatus((1 << 1) | 1)
      .toACC(0);
  });

  test("LSR, shift right on the memory ", () => {
    const nes = initNes();

    const data = 0x02;

    const _nes = LSR({
      data,

      nes,
      addr: 0x00,
    });

    expectNes(_nes).toStatus(0).toBuss(0x00, 0x01);
  });

  test("NOP", () => {
    const nes = initNes();

    const _nes = NOP({
      data: 0,

      nes,
    });

    expectNes(_nes);
  });

  test("ORA, when zero flag", () => {
    const nes = initNes();

    nes.cpu.ACC = 0;

    const _nes = ORA({
      data: 0x00,

      nes,
    });

    expectNes(_nes)
      .toACC(0)
      .toStatus(1 << 1);
  });

  test("ORA, when negative flag", () => {
    const nes = initNes();

    nes.cpu.ACC = 1 << 7;

    const _nes = ORA({
      data: 1 << 6,

      nes,
    });

    expectNes(_nes)
      .toACC((1 << 7) | (1 << 6))
      .toStatus(1 << 6);
  });

  test("PHA, push a copy of the ACC to the stack", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x12;

    const _nes = PHA({
      nes,
    } as Instruction);

    expectNes(_nes).toSTK(0xfe).toBuss(0x01ff, 0x12).toBuss(0x01fe, 0);
  });

  test("PHP, Push Processor Status", () => {
    const nes = initNes();

    nes.cpu.STATUS = 0x12;

    const _nes = PHP({
      nes,
    } as Instruction);

    expectNes(_nes).toSTK(0xfe).toBuss(0x01ff, 0x12);
  });

  test("PLA, pull accumulator a zero value", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;
    nes.cpu.STK = 0xfe;
    nes.bus[0x01ff].data = 0x00;

    const _nes = PLA({
      nes,
    } as Instruction);

    expectNes(_nes)
      .toACC(0)
      .toSTK(0xff)
      .toStatus(1 << 1);
  });
  test("PLA, pull accumulator a negative value", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x0f;
    nes.cpu.STK = 0xfe;
    nes.bus[0x01ff].data = 0xf0;

    const _nes = PLA({
      nes,
    } as Instruction);

    expectNes(_nes)
      .toSTK(0xff)
      .toACC(0xf0)
      .toStatus(1 << 6);
  });
  test("PLP, pull process Status", () => {
    const nes = initNes();

    nes.cpu.STATUS = 0x00;
    nes.cpu.STK = 0xfe;
    nes.bus[0x01ff].data = 0x12;

    const _nes = PLP({
      nes,
    } as Instruction);

    expectNes(_nes).toStatus(0x12).toSTK(0xff);
  });

  test("ROL, rotate left the accumulator when value is 1000-0000 binary carry flag is set", () => {
    const nes = initNes();

    const data = 1 << 7;

    const _nes = ROL({
      nes,
      data,
      acc: true,
    } as Instruction);

    expectNes(_nes).toACC(1).toStatus(1);
  });
  test("ROL, rotate left the memory when value is 0100-0000 binary negative flag is set", () => {
    const nes = initNes();

    const data = 1 << 6;

    const _nes = ROL({
      nes,
      data,
      addr: 0x0000,
    } as Instruction);

    expectNes(_nes)
      .toBuss(0x0000, 1 << 7)
      .toStatus(1 << 6);
  });

  test("ROL, rotate left the accumulator when value is 0x00 zero flag is set", () => {
    const nes = initNes();

    const data = 0;

    const _nes = ROL({
      nes,
      data,
      acc: true,
    } as Instruction);

    expectNes(_nes)
      .toACC(0)
      .toStatus(1 << 1);
  });

  test("ROR, rotate right the accumulator when value is 0x01 then cary flag and negative flag are set", () => {
    const nes = initNes();

    const data = 0x01;

    const _nes = ROR({
      nes,
      data,
      acc: true,
    } as Instruction);

    expectNes(_nes)
      .toACC(1 << 7)
      .toStatus((1 << 6) | 1);
  });

  test("ROR, rotate right the memory when value is 0x00 then zero flag are set", () => {
    const nes = initNes();

    nes.bus[0].data = 0x01;

    const data = 0x00;

    const _nes = ROR({
      nes,
      data,
      addr: 0x00,
    } as Instruction);

    expectNes(_nes)
      .toBuss(0, 0)
      .toStatus(1 << 1);
  });

  test("RTI, return from interrupt take STATUS and PC from the stack", () => {
    let nes = initNes();

    const STATUS = 0x12;

    const PC = 0x1234;

    nes = pushPCStack(nes, PC);
    nes = pushToStack(nes, STATUS);

    nes = RTI({
      nes,
    } as Instruction);

    expectNes(nes).toStatus(STATUS).toPC(PC);
  });
  test("RTS, return from subroutine. It pulls the PC from the stack", () => {
    let nes = initNes();

    const PC = 0x21;

    nes = pushPCStack(nes, PC);

    nes = RTS({
      nes,
    } as Instruction);

    expectNes(nes).toPC(0x22);
  });

  test("SBC, when ACC = 0xff, C = 1, M = 1  then C = 0, N = 0", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1;
    nes.cpu.ACC = 0xff;

    const data = 1;

    const _nes = SBC({
      nes,
      data,
    });

    expectNes(_nes).toACC(0xfe).toEncodeStatus("czidbvN");
  });

  test("SBC, when ACC = 0x01, C = 0, M = 0  then Z = 1", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x01;

    const data = 0;

    const _nes = SBC({
      nes,
      data,
    });

    expectNes(_nes).toACC(0x0).toEncodeStatus("cZidbvn");
  });

  test("SBC, when ACC = 64, C = -64, M = 0  then V = 1, C = 1, N = 1", () => {
    const nes = initNes();

    nes.cpu.ACC = 64;

    nes.cpu.STATUS = 1;

    const data = -64 & 0xff;

    const _nes = SBC({
      nes,
      data,
    });

    expectNes(_nes).toACC(128).toEncodeStatus("CzidbVN");
  });

  test("SEC, set carry flag", () => {
    const nes = initNes();

    const _nes = SEC({
      nes,
    } as Instruction);

    expectNes(_nes).toEncodeStatus("Czidbvn");
  });

  test("SED, set decimal flag", () => {
    const nes = initNes();

    const _nes = SED({
      nes,
    } as Instruction);

    expectNes(_nes).toEncodeStatus("cziDbvn");
  });

  test("SEI, set interrupt disable", () => {
    const nes = initNes();

    const _nes = SEI({
      nes,
    } as Instruction);

    expectNes(_nes).toEncodeStatus("czIdbvn");
  });

  test("STA, store accumulator", () => {
    const nes = initNes();

    const addr = 0x0012;

    nes.bus[addr].data = 0;

    nes.cpu.ACC = 0x34;

    const _nes = STA({
      nes,
      addr,
    } as Instruction);

    expectNes(_nes).toBuss(addr, 0x34);
  });
  test("STX, store X Register", () => {
    const nes = initNes();

    const addr = 0x0012;

    nes.bus[addr].data = 0;

    nes.cpu.X = 0x34;

    const _nes = STX({
      nes,
      addr,
    } as Instruction);

    expectNes(_nes).toBuss(addr, 0x34);
  });

  test("STY, store Y Register", () => {
    const nes = initNes();

    const addr = 0x0012;

    nes.bus[addr].data = 0;

    nes.cpu.Y = 0x34;

    const _nes = STY({
      nes,
      addr,
    } as Instruction);

    expectNes(_nes).toBuss(addr, 0x34);
  });

  test("TAX, when ACC = 0, then Z is set", () => {
    const nes = initNes();

    nes.cpu.ACC = 0;
    nes.cpu.X = 0x12;

    const _nes = TAX({
      nes,
    } as Instruction);

    expectNes(_nes).toX(0).toEncodeStatus("cZidbvn");
  });
  test("TAX, when ACC = 0x80, then Z is set", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x80;
    nes.cpu.X = 0x00;

    const _nes = TAX({
      nes,
    } as Instruction);

    expectNes(_nes).toX(0x80).toEncodeStatus("czidbvN");
  });

  test("TAY, when ACC = 0, then Z is set", () => {
    const nes = initNes();

    nes.cpu.ACC = 0;
    nes.cpu.Y = 0x12;

    const _nes = TAY({
      nes,
    } as Instruction);

    expectNes(_nes).toX(0).toEncodeStatus("cZidbvn");
  });
  test("TAY, when ACC = 0x80, then Z is set", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x80;
    nes.cpu.Y = 0x00;

    const _nes = TAY({
      nes,
    } as Instruction);

    expectNes(_nes).toY(0x80).toEncodeStatus("czidbvN");
  });
  test("TSX, transfer X to Stack, when stack is a negative number", () => {
    const nes = initNes();

    nes.cpu.STK = 0x80;

    const _nes = TSX({
      nes,
    } as Instruction);

    expectNes(_nes).toX(0x80).toEncodeStatus("czidbvN");
  });
  test("TSX, transfer X to Stack, when stack is a zero", () => {
    const nes = initNes();

    nes.cpu.STK = 0x00;

    const _nes = TSX({
      nes,
    } as Instruction);

    expectNes(_nes).toX(0x00).toEncodeStatus("cZidbvn");
  });

  test("TXA, transfer X to Accumulator a negative number", () => {
    const nes = initNes();

    nes.cpu.X = 0x80;

    const _nes = TXA({
      nes,
    } as Instruction);

    expectNes(_nes).toACC(0x80).toEncodeStatus("czidbvN");
  });

  test("TXA, transfer X to Accumulator a zero number", () => {
    const nes = initNes();

    nes.cpu.X = 0x00;

    const _nes = TXA({
      nes,
    } as Instruction);

    expectNes(_nes).toACC(0x00).toEncodeStatus("cZidbvn");
  });

  test("TXS, transfer x to stack pointer", () => {
    const nes = initNes();

    nes.cpu.STK = 0xff;

    const _nes = TXS({
      nes,
    } as Instruction);

    expectNes(_nes).toX(0xff);
  });

  test("TYA, transfer Y to ACC a negative number", () => {
    const nes = initNes();

    nes.cpu.Y = 0x80;

    const _nes = TYA({
      nes,
    } as Instruction);

    expectNes(_nes).toACC(0x80).toEncodeStatus("czidbvN");
  });

  test("TYA, transfer Y to ACC a zero number", () => {
    const nes = initNes();

    nes.cpu.Y = 0x00;

    const _nes = TYA({
      nes,
    } as Instruction);

    expectNes(_nes).toACC(0x00).toEncodeStatus("cZidbvn");
  });
  test("should not affect the status", () => {
    let nes = initNes();

    nes.cpu.STATUS = 7;

    nes = INX({
      data: 0,
      nes,

      acc: false,
      addr: 0,
    });

    expect(nes.cpu.STATUS).toBe(5);

    expect(nes.cpu.X).toBe(1);
  });

  test("should be zero flag after 255 incrementes", () => {
    let nes = initNes();

    nes.cpu.STATUS = 7;
    repeat(256).reduce((acc, curr) => {
      return INX({
        data: 0,
        nes: acc,

        acc: false,
        addr: 0,
      });
    }, nes);

    expect(nes.cpu.X).toBe(0);
    expect(getZeroFlag(nes)).toBe(1);
  });

  test("NMI, flag inactive", () => {
    let nes = initNes();
    const _nes = NMI(nes);
    expect(nes).toStrictEqual(_nes);
  });

  test("NMI, flag active", () => {
    let nes = initNes();
    nes.cpu.PC = 0x1234;
    nes = writeBusNes(0x2000, 1 << 7, nes);
    nes = writeBusNes(0xfffa, 0x12, nes);
    nes = writeBusNes(0xfffb, 0x34, nes);
    nes = NMI(nes);
    expectNes(nes).toPC(0x3412).toBuss(0x01ff, 0x12).toBuss(0x01fe, 0x34);
  });

  test("push PC to stack", () => {
    let nes = initNes();
    nes = setPC(0x1234, nes);
    nes = pushPCStack(nes, getPC(nes));

    expectNes(nes)
      .toSTK(0xff - 2)
      .toBuss(0x01ff, 0x12)
      .toBuss(0x01fe, 0x34);
  });

  test("pull PC from stack", () => {
    let nes = initNes();
    nes = pushPCStack(nes, 0x1234);
    const [PC] = pullPCStack(nes);

    expect(PC).toBe(0x1234);
  });
});
