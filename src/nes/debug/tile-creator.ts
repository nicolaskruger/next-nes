import { Nes } from "../nes";
import { writeVRam } from "../ppu/vram/vram";

export const tileCreator = (index: number, tile: number[][], nes: Nes): Nes => {
  const divideIntoTwoByte = (tile: number[]): [number, number] => {
    const extractByte = (func: (v: number) => number) => {
      return tile.map(func).reduce((acc, curr, index) => {
        return acc | (curr << (7 - index));
      }, 0);
    };
    return [extractByte((v) => v & 1), extractByte((v) => v >> 1)];
  };

  return tile.reduce((nes, tile, offset) => {
    const [a, b] = divideIntoTwoByte(tile);
    nes = writeVRam(index + offset, a, nes);
    return writeVRam(index + offset + 8, b, nes);
  }, nes);
};
