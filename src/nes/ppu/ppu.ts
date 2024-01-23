import { Bus } from "../bus/bus";
import { Scroll, initScroll } from "./scroll/scroll";
import { initSprRam } from "./spr-ram/spr-ram";
import { VRam, initVram } from "./vram/vram";

type Ppu = {
  vram: VRam;
  sprRam: Bus;
  scroll: Scroll;
};

const initPpu = (): Ppu => ({
  vram: initVram(),
  sprRam: initSprRam(),
  scroll: initScroll(),
});

export { initPpu };
export type { Ppu };
