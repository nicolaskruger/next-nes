import { Bus, simpleRead, simpleWrite } from "@/nes/bus/bus";
import { Nes } from "@/nes/nes";
import { Cpu } from "../cpu";
import { ACL, ADC, AND, BCC, BCS, BEQ, BIT, BMI } from "./instruction";

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
  STK: 0,
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
});
