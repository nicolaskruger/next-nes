import { Bus } from "../bus/bus";
import { initPpuBus } from "./bus/bus";

type Ppu = {
  bus: Bus;
};

const initPpu = (): Ppu => ({ bus: initPpuBus() });

export { initPpu };
export type { Ppu };
