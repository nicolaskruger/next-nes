import { Nes } from "@/nes/nes";
import { ACC, IMP } from "./addr";
import { Cpu } from "../cpu";
import exp from "constants";

const initCpu = (): Cpu => ({
  ACC: 0,
  PC: 0,
  STATUS: 0,
  STK: 0,
  X: 0,
  Y: 0,
});

const initNes = (): Nes => ({
  bus: {},
  cpu: initCpu(),
  ppu: {},
});

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
});
