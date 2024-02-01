import { Nes } from "../nes";
import { writeVRam } from "../ppu/vram/vram";

export const colorCreator = (index: number, nes: Nes, ...colors: number[]) => {
  return colors.reduce(
    (nes, color, offset) => writeVRam(index + offset, color, nes),
    nes
  );
};
