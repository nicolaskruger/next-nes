import { Nes } from "../nes";
import { writeVRam } from "../ppu/vram/vram";
export const MUSHROOM_TILE = [
  [0, 0, 2, 2, 2, 2, 0, 0],
  [0, 2, 2, 2, 2, 2, 2, 0],
  [0, 2, 2, 2, 2, 2, 2, 0],
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
  [0, 3, 1, 1, 1, 1, 3, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
];

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
export const createMushroomTile = (index: number, nes: Nes) =>
  tileCreator(index, MUSHROOM_TILE, nes);
