import { Bus } from "../bus/bus";
import { Scroll, initScroll } from "./scroll/scroll";
import { initSprRam } from "./spr-ram/spr-ram";
import { initPpuVRam } from "./vram/vram";

export type AddrVRamStatus = "low" | "hight";

type Ppu = {
  vram: Bus;
  sprRam: Bus;
  addrVramStatus: AddrVRamStatus;
  addrVRam: number;
  scroll: Scroll;
};

const initPpu = (): Ppu => ({
  vram: initPpuVRam(),
  sprRam: initSprRam(),
  addrVramStatus: "hight",
  addrVRam: 0x0000,
  scroll: initScroll(),
});

export { initPpu };
export type { Ppu };
