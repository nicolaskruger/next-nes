import { Bus } from "../bus/bus";
import { Nes } from "../nes";
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
  firstRead: boolean;
};

const initPpu = (): Ppu => ({
  vram: initPpuVRam(),
  sprRam: initSprRam(),
  addrVramStatus: "hight",
  addrVRam: 0x0000,
  firstRead: true,
  scroll: initScroll(),
});

export const getVRamAddr = (nes: Nes) => nes.ppu.addrVRam;
export const getFirstRead = (nes: Nes) => nes.ppu.firstRead;

export { initPpu };
export type { Ppu };
