import { Bus } from "../bus/bus";
import { initSprRam } from "./spr-ram/spr-ram";
import { initPpuVRam } from "./vram/vram";

export type AddrVRamStatus = "low" | "hight";

type Ppu = {
  vram: Bus;
  sprRam: Bus;
  addrVramStatus: AddrVRamStatus;
  addrVRam: number;
};

const initPpu = (): Ppu => ({
  vram: initPpuVRam(),
  sprRam: initSprRam(),
  addrVramStatus: "hight",
  addrVRam: 0x0000,
});

export { initPpu };
export type { Ppu };
