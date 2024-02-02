import { repeat } from "../helper/repeat";
import { Nes, initNes } from "../nes";
import { initMatrix } from "../ppu/render/render";
import { colorCreator } from "./color-creeator";
import {
  createGreenGround,
  createGround,
  createMushroomTile,
} from "./tile-creator";
import { writeVRam } from "../ppu/vram/vram";

export const createAttributeTable = (
  index: number,
  attributeTable: number[][],
  nes: Nes
): Nes => {
  const combination = (y: number, x: number) => [
    { y, x },
    { y, x: x + 1 },
    { y: y + 1, x },
    { y: y + 1, x: x + 1 },
  ];
  let result = nes;
  let addr = 0;
  for (let y = 0; y < 16; y += 2)
    for (let x = 0; x < 16; x += 2) {
      const slice = y === 14 ? 2 : 4;
      const value = combination(y, x)
        .slice(0, slice)
        .map(({ x, y }) => attributeTable[y][x])
        .reduce((acc, curr, index) => acc | (curr << (index * 2)), 0);
      result = writeVRam(index + addr++, value, result);
    }
  return result;
};

export const createMushroomWord = () => {
  const nameTable = initMatrix(0, 32, 30);
  const attributeTable = initMatrix(0, 16, 15);

  nameTable[27] = repeat(30).map((_) => 1);
  nameTable[28] = repeat(30).map((_) => 2);
  nameTable[29] = repeat(30).map((_) => 3);
  attributeTable[14] = repeat(16).map((_) => 1);

  let nes = initNes();

  nes = colorCreator(0x3f00, nes, 0x3f, 0x28, 0x16, 0x27);
  nes = colorCreator(0x3f04, nes, 0x3f, 0x8, 0x9, 0x18);

  nes = createMushroomTile(0x10, nes);
  nes = createGreenGround(0x20, nes);
  nes = createGround(0x30, nes);
};
