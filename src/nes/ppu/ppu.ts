import { Bus } from "../bus/bus";
import { Scroll, initScroll } from "./scroll/scroll";
import { initSprRam } from "./spr-ram/spr-ram";
import { initVBlank, VBlank } from "./v-blank/v-blank";
import { VRam, initVram } from "./vram/vram";

type Ppu = {
  vram: VRam;
  sprRam: Bus;
  scroll: Scroll;
  vBlank: VBlank;
};

const initPpu = (): Ppu => ({
  vram: initVram(),
  sprRam: initSprRam(),
  scroll: initScroll(),
  vBlank: initVBlank(),
});

export { initPpu };
export type { Ppu };
