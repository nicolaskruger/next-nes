import { Bus, simpleRead, simpleWrite } from "@/nes/bus/bus";
import { Nes } from "@/nes/nes";
import { Cpu } from "../cpu";
import {
  ACL,
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
});

const initNes = (): Nes => ({
  bus: initBus(),
  cpu: initCpu(),
  ppu: {},
});

describe("instruction test", () => {
  test("ADC,  when carry flag, zero flag is set", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;
    const { nes: newNes, totalCycle } = ADC({
      data: 0x01,
      nes,
      baseCycles: 2,
      cross: true,
      offsetOnCross: 2,
    });

    expect(totalCycle).toBe(4);
    expect(newNes.cpu.STATUS).toBe((1 << 1) | 1);
    expect(newNes.cpu.ACC).toBe(0x00);
  });
  test("ADC,  when negative flag is set", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;
    const { nes: newNes, totalCycle } = ADC({
      data: 0x00,
      nes,
      baseCycles: 2,
      cross: false,
      offsetOnCross: 2,
    });

    expect(totalCycle).toBe(2);
    expect(newNes.cpu.STATUS).toBe(1 << 6);
    expect(newNes.cpu.ACC).toBe(0xff);
  });
  test("ADC, when overflow is set", () => {
    const nes = initNes();
    nes.cpu.ACC = 64;
    const data = 64;

    const { nes: newNes, totalCycle } = ADC({
      data,
      nes,
      baseCycles: 1,
      cross: false,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(1);

    expect(newNes.cpu.STATUS).toBe((1 << 6) | (1 << 5));

    expect(newNes.cpu.ACC).toBe(128);
  });

  test("AND, when result is zero", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x00;

    const data = 0xff;

    const { nes: newNes, totalCycle } = AND({
      baseCycles: 1,
      cross: true,
      offsetOnCross: 2,
      nes,
      data,
    });

    expect(totalCycle).toBe(3);

    expect(newNes.cpu.ACC).toBe(0x00);

    expect(newNes.cpu.STATUS).toBe(1 << 1);
  });

  test("AND, when result is negative", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xf0;

    const data = 0xa0;

    const { nes: newNes, totalCycle } = AND({
      baseCycles: 1,
      cross: true,
      offsetOnCross: 2,
      nes,
      data,
    });

    expect(totalCycle).toBe(3);

    expect(newNes.cpu.ACC).toBe(0xa0);

    expect(newNes.cpu.STATUS).toBe(1 << 6);
  });

  test("ASL, when cary flag and zero flag is set", () => {
    const nes = initNes();
    const data = 0x80;

    const { nes: newNes, totalCycle } = ACL({
      baseCycles: 1,
      cross: true,
      data,
      nes,
      offsetOnCross: 1,
    });

    expect(totalCycle).toBe(2);

    expect(newNes.cpu.ACC).toBe(0x00);

    expect(newNes.cpu.STATUS).toBe((1 << 1) | 1);
  });

  test("ASL, when negative is set", () => {
    const nes = initNes();
    const data = 0x40;

    const { nes: newNes, totalCycle } = ACL({
      baseCycles: 1,
      cross: true,
      data,
      nes,
      offsetOnCross: 1,
    });

    expect(totalCycle).toBe(2);

    expect(newNes.cpu.ACC).toBe(0x80);

    expect(newNes.cpu.STATUS).toBe(1 << 6);
  });

  test("BCC, branch not occur", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1;

    const { nes: newNes, totalCycle } = BCC({
      baseCycles: 2,
      cross: false,
      data: 2,
      nes,
      offsetOnCross: 0,
    });

    expect(newNes.cpu.PC).toBe(0);
    expect(totalCycle).toBe(2);
  });

  test("BCC, branch occur and got to another page", () => {
    const nes = initNes();

    nes.cpu.PC = 0xff;
    nes.cpu.STATUS = 0;

    const { nes: newNes, totalCycle } = BCC({
      baseCycles: 2,
      cross: false,
      data: 2,
      nes,
      offsetOnCross: 0,
    });

    expect(newNes.cpu.PC).toBe(0x101);
    expect(totalCycle).toBe(5);
  });

  test("BCS, branch not occur", () => {
    const nes = initNes();

    nes.cpu.STATUS = 0;

    const { nes: newNes, totalCycle } = BCS({
      baseCycles: 2,
      cross: false,
      data: 2,
      nes,
      offsetOnCross: 0,
    });

    expect(newNes.cpu.PC).toBe(0);
    expect(totalCycle).toBe(2);
  });

  test("BCS, branch occur and got to another page", () => {
    const nes = initNes();

    nes.cpu.PC = 0xff;
    nes.cpu.STATUS = 1;

    const { nes: newNes, totalCycle } = BCS({
      baseCycles: 2,
      cross: false,
      data: 2,
      nes,
      offsetOnCross: 0,
    });

    expect(newNes.cpu.PC).toBe(0x101);
    expect(totalCycle).toBe(5);
  });

  test("BEQ, branch not occur", () => {
    const nes = initNes();

    nes.cpu.STATUS = 0;

    const { nes: newNes, totalCycle } = BEQ({
      baseCycles: 2,
      cross: false,
      data: 2,
      nes,
      offsetOnCross: 0,
    });

    expect(newNes.cpu.PC).toBe(0);
    expect(totalCycle).toBe(2);
  });

  test("BEQ, branch occur and got to another page", () => {
    const nes = initNes();

    nes.cpu.PC = 0xff;
    nes.cpu.STATUS = 1 << 1;

    const { nes: newNes, totalCycle } = BEQ({
      baseCycles: 2,
      cross: false,
      data: 2,
      nes,
      offsetOnCross: 0,
    });

    expect(newNes.cpu.PC).toBe(0x101);
    expect(totalCycle).toBe(5);
  });

  test("BIT, when the bit 6 and bit 7 are set", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;

    const { nes: newNes, totalCycle } = BIT({
      baseCycles: 3,
      cross: false,
      data: (1 << 7) | (1 << 6),
      nes,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(3);

    expect(newNes.cpu.STATUS).toBe((1 << 6) | (1 << 5));

    expect(newNes.cpu.ACC).toBe(0xff);
  });
  test("BIT, when zero flag to be set", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;

    const { nes: newNes, totalCycle } = BIT({
      baseCycles: 3,
      cross: false,
      data: 0,
      nes,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(3);

    expect(newNes.cpu.STATUS).toBe(1);
  });

  test("BMI, should not increment the PC niter add additional cycles when negative flag is clear", () => {
    const nes = initNes();
    nes.cpu.STATUS = 0;

    const { nes: newNes, totalCycle } = BMI({
      nes,
      data: 0x0f,
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(2);

    expect(newNes.cpu.PC).toBe(0);
  });

  test("BMI, should increment the PC and add additional cycles when negative flag is set", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 6;

    nes.cpu.PC = 0x01f1;

    const { nes: newNes, totalCycle } = BMI({
      nes,
      data: 0x0f,
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(5);

    expect(newNes.cpu.PC).toBe(0x0200);
  });

  test("BNE, should not increment the PC nether add additional cycles when zero flag is set", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 1;

    const { nes: newNes, totalCycle } = BNE({
      nes,
      data: 0x0f,
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(2);

    expect(newNes.cpu.PC).toBe(0);
  });

  test("BNE, should increment the PC and add additional cycles when zero flag is clear and cross to a new page", () => {
    const nes = initNes();

    nes.cpu.STATUS = 0;

    nes.cpu.PC = 0x01f1;

    const { nes: newNes, totalCycle } = BNE({
      nes,
      data: 0x0f,
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(5);

    expect(newNes.cpu.PC).toBe(0x0200);
  });
  test("BPL, should not increment the PC nether add additional cycles when negative flag is set", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 6;

    const { nes: newNes, totalCycle } = BPL({
      nes,
      data: 0x0f,
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(2);

    expect(nes.cpu.PC).toBe(0);
  });

  test("BPL, should increment the PC and add additional cycles when negative flag is clear", () => {
    const nes = initNes();

    nes.cpu.STATUS = 0;

    nes.cpu.PC = 0x01f1;

    const { nes: newNes, totalCycle } = BPL({
      nes,
      data: 0x0f,
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(5);

    expect(newNes.cpu.PC).toBe(0x0200);
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

    const { nes: newNes, totalCycle } = BRK({
      nes,
      data: 0,
      baseCycles: 7,
      cross: false,
      offsetOnCross: 0,
    });

    expect(newNes.cpu.STK).toBe(0xfd);
    expect(newNes.bus[0x01ff].data).toBe(2);
    expect(newNes.bus[0x01fe].data).toBe(1);
    expect(newNes.cpu.PC).toBe(0xfffe);
    expect(totalCycle).toBe(7);
    expect(newNes.cpu.STATUS).toBe((1 << 4) | 1);
  });

  test("BVC, should not branch if overflow is set", () => {
    const nes = initNes();

    nes.cpu.PC = 0x00;

    nes.cpu.STATUS = 1 << 5;

    const { totalCycle, nes: newNes } = BVC({
      nes,
      cross: false,
      baseCycles: 2,
      data: 0xff,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(2);
    expect(newNes.cpu.PC).toBe(0);
  });
  test("BVC, should branch when overflow is clear", () => {
    const nes = initNes();

    nes.cpu.PC = 0x01f1;

    nes.cpu.STATUS = 0;

    const { totalCycle, nes: newNes } = BVC({
      nes,
      cross: false,
      baseCycles: 2,
      data: 0x0f,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(5);
    expect(newNes.cpu.PC).toBe(0x0200);
  });

  test("BVS, should not branch if overflow is clear", () => {
    const nes = initNes();

    nes.cpu.PC = 0x00;

    nes.cpu.STATUS = 0;

    const { totalCycle, nes: newNes } = BVS({
      nes,
      cross: false,
      baseCycles: 2,
      data: 0xff,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(2);
    expect(newNes.cpu.PC).toBe(0);
  });
  test("BVS, should branch when overflow is set", () => {
    const nes = initNes();

    nes.cpu.PC = 0x01f1;

    nes.cpu.STATUS = 1 << 5;

    const { totalCycle, nes: newNes } = BVS({
      nes,
      cross: false,
      baseCycles: 2,
      data: 0x0f,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(5);
    expect(newNes.cpu.PC).toBe(0x0200);
  });

  test("CLC, should clear the carry flag", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1;

    const { nes: newNes, totalCycle } = CLC({
      baseCycles: 2,
      cross: false,
      data: 0,
      nes,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(2);

    expect(newNes.cpu.STATUS).toBe(0);
  });

  test("CLD, should clear decimal mode", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 3;

    const { nes: newNes, totalCycle } = CLD({
      baseCycles: 2,
      cross: false,
      data: 0,
      nes,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(2);

    expect(newNes.cpu.STATUS).toBe(0);
  });

  test("CLI, should clear interrupt disable", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 2;

    const { nes: newNes, totalCycle } = CLI({
      baseCycles: 2,
      cross: false,
      data: 0,
      nes,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(2);

    expect(newNes.cpu.STATUS).toBe(0);
  });

  test("CLV, should clear overflow", () => {
    const nes = initNes();

    nes.cpu.STATUS = 1 << 5;

    const { nes: newNes, totalCycle } = CLV({
      baseCycles: 2,
      cross: false,
      data: 0,
      nes,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(2);

    expect(newNes.cpu.STATUS).toBe(0);
  });

  test("CMP, should set carry flag if ACC >== memory", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x0f;
    const data = 0x0e;

    const { totalCycle, nes: newNes } = CMP({
      baseCycles: 3,
      cross: true,
      offsetOnCross: 2,
      data,
      nes,
    });

    expect(totalCycle).toBe(5);

    expect(newNes.cpu.STATUS).toBe(1);
  });
  test("CMP, should set zero flag if ACC === memory", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x0f;
    const data = 0x0f;

    const { totalCycle, nes: newNes } = CMP({
      baseCycles: 3,
      cross: true,
      offsetOnCross: 2,
      data,
      nes,
    });

    expect(totalCycle).toBe(5);

    expect(newNes.cpu.STATUS).toBe((1 << 1) | 1);
  });
  test("CMP, should negative flag if the result was negative", () => {
    const nes = initNes();

    nes.cpu.ACC = 0x0e;
    const data = 0x0f;

    const { totalCycle, nes: newNes } = CMP({
      baseCycles: 3,
      cross: true,
      offsetOnCross: 2,
      data,
      nes,
    });

    expect(totalCycle).toBe(5);

    expect(newNes.cpu.STATUS).toBe(1 << 6);
  });

  test("CPX, should set carry flag if X >= memory", () => {
    const nes = initNes();
    nes.cpu.X = 0x0e;
    const data = 0x0d;
    const { totalCycle, nes: newNes } = CPX({
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });
    expect(totalCycle).toBe(2);
    expect(newNes.cpu.STATUS).toBe(1);
  });

  test("CPX, should set zero flag if X === memory", () => {
    const nes = initNes();
    nes.cpu.X = 0x0e;
    const data = 0x0e;
    const { totalCycle, nes: newNes } = CPX({
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });
    expect(totalCycle).toBe(2);
    expect(newNes.cpu.STATUS).toBe((1 << 1) | 1);
  });

  test("CPX, should set negative flag if the result was negative", () => {
    const nes = initNes();
    nes.cpu.X = 0xfe;
    const data = 0x0e;
    const { totalCycle, nes: newNes } = CPX({
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });
    expect(totalCycle).toBe(2);
    expect(newNes.cpu.STATUS).toBe(1 << 6);
  });

  test("CPY, should set carry flag when Y >= memory", () => {
    const nes = initNes();

    nes.cpu.Y = 0x0f;
    const data = 0x0e;

    const { nes: newNes, totalCycle } = CPY({
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });

    expect(totalCycle).toBe(2);

    expect(newNes.cpu.STATUS).toBe(1);
  });

  test("CPY, should set zero flag when Y == memory", () => {
    const nes = initNes();

    nes.cpu.Y = 0xfe;
    const data = 0xfe;

    const { nes: newNes, totalCycle } = CPY({
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });

    expect(totalCycle).toBe(2);

    expect(newNes.cpu.STATUS).toBe((1 << 1) | 1);
  });

  test("CPY, should set negative flag when the result was negative", () => {
    const nes = initNes();

    nes.cpu.Y = 0xff;
    const data = 0x0e;

    const { nes: newNes, totalCycle } = CPY({
      baseCycles: 2,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });

    expect(totalCycle).toBe(2);

    expect(newNes.cpu.STATUS).toBe(1 << 6);
  });
  test("DEC, should decrement memory and ser zero flag when memory = 1", () => {
    const nes = initNes();

    nes.bus[0].data = 0x01;

    const data = 0x00;

    const { totalCycle, nes: newNes } = DEC({
      baseCycles: 5,
      cross: false,
      data,
      nes,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(5);
    expect(newNes.cpu.STATUS).toBe(1 << 1);
    expect(newNes.bus[0].data).toBe(0);
  });

  test("DEC, should decrement memory and ser negative flag when memory = 0", () => {
    const nes = initNes();

    nes.bus[0].data = 0x00;

    const data = 0x00;

    const { totalCycle, nes: newNes } = DEC({
      baseCycles: 5,
      cross: false,
      data,
      nes,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(5);
    expect(newNes.cpu.STATUS).toBe(1 << 6);
    expect(newNes.bus[0].data).toBe(0xff);
  });
  test("DEX, decrement X to zero", () => {
    const nes = initNes();

    nes.cpu.X = 1;

    const data = 0x00;

    const { totalCycle, nes: newNes } = DEX({
      baseCycles: 2,
      cross: false,
      data,
      nes,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(2);

    expect(newNes.cpu.X).toBe(0);

    expect(newNes.cpu.STATUS).toBe(1 << 1);
  });

  test("DEX, decrement X to 0xff", () => {
    const nes = initNes();

    nes.cpu.X = 0;

    const data = 0x00;

    const { totalCycle, nes: newNes } = DEX({
      baseCycles: 2,
      cross: false,
      data,
      nes,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(2);

    expect(newNes.cpu.X).toBe(0xff);

    expect(newNes.cpu.STATUS).toBe(1 << 6);
  });

  test("DEY, decrement Y to zero", () => {
    const nes = initNes();

    nes.cpu.Y = 1;

    const data = 0x00;

    const { totalCycle, nes: newNes } = DEY({
      baseCycles: 2,
      cross: false,
      data,
      nes,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(2);

    expect(newNes.cpu.Y).toBe(0);

    expect(newNes.cpu.STATUS).toBe(1 << 1);
  });

  test("DEY, decrement Y to 0xff", () => {
    const nes = initNes();

    nes.cpu.Y = 0;

    const data = 0x00;

    const { totalCycle, nes: newNes } = DEY({
      baseCycles: 2,
      cross: false,
      data,
      nes,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(2);

    expect(newNes.cpu.Y).toBe(0xff);

    expect(newNes.cpu.STATUS).toBe(1 << 6);
  });

  test("EOR, should result in zero when ACC = 0xff and M = 0xff, set the zero flag and cross page", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;
    const data = 0xff;

    const { nes: _nes, totalCycle } = EOR({
      baseCycles: 4,
      cross: true,
      data,
      nes,
      offsetOnCross: 1,
    });

    expect(totalCycle).toBe(5);

    expect(_nes.cpu.ACC).toBe(0);

    expect(_nes.cpu.STATUS).toBe(1 << 1);
  });
  test("EOR, should result in negative when ACC = 0xff and M = 0x00, set the zero flag and cross page", () => {
    const nes = initNes();

    nes.cpu.ACC = 0xff;
    const data = 0x00;

    const { nes: _nes, totalCycle } = EOR({
      baseCycles: 4,
      cross: true,
      data,
      nes,
      offsetOnCross: 1,
    });

    expect(totalCycle).toBe(5);

    expect(_nes.cpu.ACC).toBe(0xff);

    expect(_nes.cpu.STATUS).toBe(1 << 6);
  });

  test("INC, increment memory when value is 0xff and zero flag going to be set", () => {
    const _nes = initNes();

    _nes.bus[0x01].data = 0xff;

    const data = 0x01;

    const { nes, totalCycle } = INC({
      baseCycles: 5,
      cross: true,
      offsetOnCross: 0,
      data,
      nes: _nes,
    });

    expect(totalCycle).toBe(5);

    expect(nes.cpu.STATUS).toBe(1 << 1);

    expect(nes.bus[0x01].data).toBe(0);
  });
  test("INC, increment memory when value is 0x7f and negative flag is set resulting in 0x80", () => {
    const nes = initNes();

    nes.bus[0x01].data = 0x7f;

    const data = 0x01;

    const { nes: _nes, totalCycle } = INC({
      baseCycles: 5,
      cross: true,
      offsetOnCross: 0,
      data,
      nes,
    });

    expect(totalCycle).toBe(5);

    expect(_nes.cpu.STATUS).toBe(1 << 6);

    expect(_nes.bus[0x01].data).toBe(0x80);
  });

  test("INX, increment X and set de Zero Flag", () => {
    const nes = initNes();

    nes.cpu.X = 0xff;

    const data = 0x00;

    const { nes: _nes, totalCycle } = INX({
      baseCycles: 5,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });

    expect(totalCycle).toBe(5);
    expect(_nes.cpu.STATUS).toBe(1 << 1);
    expect(_nes.cpu.X).toBe(0);
  });

  test("INX, increment X and set de Negative Flag", () => {
    const nes = initNes();

    nes.cpu.X = 0x7f;

    const data = 0x00;

    const { nes: _nes, totalCycle } = INX({
      baseCycles: 5,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });

    expect(totalCycle).toBe(5);
    expect(_nes.cpu.STATUS).toBe(1 << 6);
    expect(_nes.cpu.X).toBe(0x80);
  });

  test("INY, increment Y and set de Zero Flag", () => {
    const nes = initNes();

    nes.cpu.Y = 0xff;

    const data = 0x00;

    const { nes: _nes, totalCycle } = INY({
      baseCycles: 5,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });

    expect(totalCycle).toBe(5);
    expect(_nes.cpu.STATUS).toBe(1 << 1);
    expect(_nes.cpu.Y).toBe(0);
  });

  test("INY, increment Y and set de Negative Flag", () => {
    const nes = initNes();

    nes.cpu.Y = 0x7f;

    const data = 0x00;

    const { nes: _nes, totalCycle } = INY({
      baseCycles: 5,
      cross: false,
      offsetOnCross: 0,
      data,
      nes,
    });

    expect(totalCycle).toBe(5);
    expect(_nes.cpu.STATUS).toBe(1 << 6);
    expect(_nes.cpu.Y).toBe(0x80);
  });

  test("JMP", () => {
    const nes = initNes();

    const data = 0x1234;

    const { nes: _nes, totalCycle } = JMP({
      baseCycles: 5,
      cross: true,
      offsetOnCross: 0,
      data,
      nes,
    });

    expect(_nes.cpu.PC).toBe(0x1234);

    expect(totalCycle).toBe(5);
  });
});
