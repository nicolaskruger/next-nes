import { Bus } from "./bus/bus";
import { Cpu } from "./cpu/cpu";
import { Ppu } from "./ppu/ppu";

type Nes = {
  cpu: Cpu;
  ppu: Ppu;
  bus: Bus;
};

export type { Nes };
