import { Bus } from "../bus/bus";
import { initSprRam } from "./spr-ram/spr-ram";
import { initPpuVRam } from "./vram/vram";

type Ppu = {
  vram: Bus;
  sprRam: Bus;
};

const initPpu = (): Ppu => ({ vram: initPpuVRam(), sprRam: initSprRam() });

export { initPpu };
export type { Ppu };
