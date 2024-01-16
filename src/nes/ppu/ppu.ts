import { Bus } from "../bus/bus";
import { initPpuVRam } from "./vram/vram";

type Ppu = {
  vram: Bus;
};

const initPpu = (): Ppu => ({ vram: initPpuVRam() });

export { initPpu };
export type { Ppu };
