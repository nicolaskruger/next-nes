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

export const GROUND = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

export const GROUND_GREEN = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 1, 2, 1, 2, 1, 1],
  [2, 1, 1, 1, 1, 2, 1, 1],
  [1, 1, 1, 1, 1, 2, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

export const MAGE = [
  [0, 0, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 2, 2, 2, 1],
  [1, 1, 1, 2, 3, 2, 3, 0],
  [1, 0, 1, 2, 2, 2, 2, 0],
  [0, 0, 3, 1, 2, 2, 1, 0],
  [0, 1, 2, 1, 1, 1, 2, 3],
  [0, 0, 1, 1, 1, 1, 1, 0],
];

export const STICK = [
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
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

export const createGround = (index: number, nes: Nes) =>
  tileCreator(index, GROUND, nes);

export const createMushroomTile = (index: number, nes: Nes) =>
  tileCreator(index, MUSHROOM_TILE, nes);

export const createGreenGround = (index: number, nes: Nes) =>
  tileCreator(index, GROUND_GREEN, nes);

export const createMage = (index: number, nes: Nes) =>
  tileCreator(index, MAGE, nes);

export const createStick = (index: number, nes: Nes) =>
  tileCreator(index, STICK, nes);
