import { Bus } from "../bus/bus";
import { initSprRam } from "./spr-ram/spr-ram";
import { initPpuVRam } from "./vram/vram";

export type PpuStatusRegister = "low" | "hight";

type Ppu = {
  vram: Bus;
  sprRam: Bus;
  registerStatus: PpuStatusRegister;
  register: number;
};

const initPpu = (): Ppu => ({
  vram: initPpuVRam(),
  sprRam: initSprRam(),
  registerStatus: "hight",
  register: 0x0000,
});

export { initPpu };
export type { Ppu };
