import { Nes, initNes } from "../nes";
import { renderTile } from "../ppu/render/render";
import { colorCreator } from "./color-creeator";
import { createGround } from "./tile-creator";

describe("tile creator", () => {
  let nes: Nes;

  beforeEach(() => {
    nes = initNes();
  });
  test("should create tile on 0x10", () => {
    nes = colorCreator(0x3f04, nes, 0x3f, 0x8, 0x9, 0x18);
    nes = createGround(0x10, nes);
    const [ground] = renderTile(nes, 1, 0x3f04);

    ground.forEach((g) => g.forEach((pixel) => expect(pixel).toBe("#432f00")));
  });
});
