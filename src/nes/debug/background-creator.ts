import { repeat } from "../helper/repeat";
import { Nes, initNes } from "../nes";
import { initMatrix } from "../ppu/render/render";
import { colorCreator } from "./color-creeator";
import {
  createGreenGround,
  createGround,
  createMage,
  createMushroomTile,
  createStick,
} from "./tile-creator";
import { writeRangeVRam, writeVRam } from "../ppu/vram/vram";
import { spriteCreator } from "./sprite-creator";
import { compile } from "../cpu/compiler/compiler";
import { compileNes } from "../cpu/runner/runner";
import { writeBusNes } from "../bus/bus";

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
  for (let y = 0; y < 15; y += 2)
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

export const createNameTable = (
  index: number,
  nameTable: number[][],
  nes: Nes
): Nes => {
  const values = nameTable.reduce((acc, curr) => [...acc, ...curr], []);
  return writeRangeVRam(index, values, nes);
};

export const createMushroomWord = () => {
  const nameTable = initMatrix(0, 32, 30);
  const attributeTable = initMatrix(0, 16, 15);

  nameTable[27] = repeat(32).map((_) => 1);
  nameTable[27][0] = 5;
  nameTable[28] = repeat(32).map((_) => 2);
  nameTable[29] = repeat(32).map((_) => 3);
  attributeTable[14] = repeat(16).map((_) => 1);

  let nes = initNes();

  nes = colorCreator(0x3f00, nes, 0x3f, 0x28, 0x16, 0x27);
  nes = colorCreator(0x3f04, nes, 0x3f, 0x8, 0x9, 0x18);
  nes = colorCreator(0x3f10, nes, 0x3f, 0x03, 0x3f, 0x30);
  nes = colorCreator(0x3f14, nes, 0x3f, 0x24, 0x3f, 0x30);
  nes = colorCreator(0x3f18, nes, 0x3f, 0x28, 0x3f, 0x30);
  nes = colorCreator(0x3f1c, nes, 0x3f, 0x2c, 0x3f, 0x30);

  nes = createMushroomTile(0x10, nes);
  nes = createGreenGround(0x20, nes);
  nes = createGround(0x30, nes);
  nes = createMage(0x40, nes);
  nes = createStick(0x50, nes);
  nes = createNameTable(0x2000, nameTable, nes);
  nes = createAttributeTable(0x23c0, attributeTable, nes);

  nes = spriteCreator(0, 0, 4, "front", false, false, 0, 0, nes);
  nes = spriteCreator(1, 1, 4, "back", false, false, 0, 8 * 27, nes);
  nes = spriteCreator(2, 2, 4, "front", true, false, 8, 0, nes);
  nes = spriteCreator(3, 3, 4, "front", false, true, 16, 0, nes);

  nes = writeBusNes(0x2001, (1 << 4) | (1 << 3), nes);

  const program = compile(`
    CLC
    LSR A
    LDA #10
    LDA $00
    STY $10,X
    LDX $10,Y
    BNE *+4
    JMP $800f
    STA $3000,X
    AND $4000,Y
    LDA ($40,X)
    LDA ($40),Y
    JMP $8000
  `);

  nes = compileNes(program, nes);

  return nes;
};
