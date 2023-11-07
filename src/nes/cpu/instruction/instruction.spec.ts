import { Bus, simpleRead, simpleWrite } from "@/nes/bus/bus";
import { Nes } from "@/nes/nes";
import { Cpu } from "../cpu";
import { ADC } from "./instruction";

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
      offsetOnBranchSucceed: 0,
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
      offsetOnBranchSucceed: 0,
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
      offsetOnBranchSucceed: 0,
      offsetOnCross: 0,
    });

    expect(totalCycle).toBe(1);

    expect(newNes.cpu.STATUS).toBe((1 << 6) | (1 << 5));

    expect(newNes.cpu.ACC).toBe(128);
  });
});
