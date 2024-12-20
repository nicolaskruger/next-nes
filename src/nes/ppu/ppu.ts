import { Bus } from "../bus/bus";
import { initRefresh, Refresh } from "./refresh/refresh";
import { Scroll, initScroll } from "./scroll/scroll";
import { initSprRam } from "./spr-ram/spr-ram";
import { VRam, initVram } from "./vram/vram";

type Ppu = {
  vram: VRam;
  sprRam: Bus;
  scroll: Scroll;
  refresh: Refresh;
};

const initPpu = (): Ppu => ({
  vram: initVram(),
  sprRam: initSprRam(),
  scroll: initScroll(),
  refresh: initRefresh(),
});

export { initPpu };
export type { Ppu };
