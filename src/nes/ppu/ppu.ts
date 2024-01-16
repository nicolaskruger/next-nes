import { Bus } from "../bus/bus";
import { initPpuBus } from "./vram/vram";

type Ppu = {
  vram: Bus;
};

const initPpu = (): Ppu => ({ vram: initPpuBus() });

export { initPpu };
export type { Ppu };
