import { Nes } from "../nes";
import { writeSprRam } from "../ppu/spr-ram/spr-ram";

export const spriteCreator = (
  sprIndex: number,
  pallet: number,
  tile: number,
  bgPosition: "back" | "front",
  horizontalMirror: boolean,
  verticalMirror: boolean,
  x: number,
  y: number,
  nes: Nes
) => {
  let index = sprIndex * 4;

  const bgPositionToNumber = bgPosition === "front" ? 0 : 1;
  nes = writeSprRam(index++, y, nes);
  nes = writeSprRam(index++, tile, nes);

  const byte2 =
    pallet |
    (bgPositionToNumber << 5) |
    (Number(horizontalMirror) << 6) |
    (Number(verticalMirror) << 7);

  nes = writeSprRam(index++, byte2, nes);
  nes = writeSprRam(index++, x, nes);
  return nes;
};
