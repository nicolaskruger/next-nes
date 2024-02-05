import { Nes, initNes } from "@/nes/nes";
import {
  initMatrix,
  renderAttributeTable,
  renderBackGround,
  renderNameTable,
  renderTile,
  renderTileOnScreen,
} from "./render";
import { readRangeVRam, readVRam, writeVRam } from "../vram/vram";
import { createMushroomWord } from "@/nes/debug/background-creator";
import { repeat } from "@/nes/helper/repeat";
import { getAttributeTable } from "../registers/registers";

const binaryToInt = (binary: string) => parseInt(binary, 2);

describe("render", () => {
  let nes: Nes;

  beforeEach(() => {
    nes = initNes();
  });
  test("name table", () => {
    const [nameTable] = renderNameTable(nes);

    expect(nameTable.length).toBe(30);
    nameTable.forEach((table) => {
      expect(table.length).toBe(32);
      table.forEach((t) => expect(t).toBe(0));
    });
  });

  test("attribute table", () => {
    nes = writeVRam(0x23c0, binaryToInt("11100100"), nes);
    nes = writeVRam(0x23f8, binaryToInt("11100100"), nes);
    const [attributeTable] = renderAttributeTable(nes);

    expect(attributeTable[0][0]).toBe(0);
    expect(attributeTable[0][1]).toBe(0);
    expect(attributeTable[1][0]).toBe(0);
    expect(attributeTable[1][1]).toBe(0);

    expect(attributeTable[0][2]).toBe(1);
    expect(attributeTable[0][3]).toBe(1);
    expect(attributeTable[1][2]).toBe(1);
    expect(attributeTable[1][3]).toBe(1);

    expect(attributeTable[2][0]).toBe(2);
    expect(attributeTable[2][1]).toBe(2);
    expect(attributeTable[3][0]).toBe(2);
    expect(attributeTable[3][1]).toBe(2);

    expect(attributeTable[2][2]).toBe(3);
    expect(attributeTable[2][3]).toBe(3);
    expect(attributeTable[3][2]).toBe(3);
    expect(attributeTable[3][3]).toBe(3);

    expect(attributeTable[28][0]).toBe(0);
    expect(attributeTable[28][1]).toBe(0);
    expect(attributeTable[29][0]).toBe(0);
    expect(attributeTable[29][1]).toBe(0);

    expect(attributeTable[28][2]).toBe(1);
    expect(attributeTable[28][3]).toBe(1);
    expect(attributeTable[29][2]).toBe(1);
    expect(attributeTable[29][3]).toBe(1);

    expect(attributeTable.length).toBe(30);
    attributeTable.forEach((table) => {
      expect(table.length).toBe(32);
    });
  });

  test("render tile on screen", () => {
    let screen: number[][] = initMatrix(0, 4, 4);

    const tile1 = initMatrix(1, 2, 2);
    const tile2 = initMatrix(2, 2, 2);

    screen = renderTileOnScreen(screen, tile1, 0, 0);
    screen = renderTileOnScreen(screen, tile2, 2, 2);
    expect(screen).toStrictEqual([
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 2, 2],
      [0, 0, 2, 2],
    ]);
  });

  test("should not render tile when out of range", () => {
    let screen: number[][] = initMatrix(0, 4, 4);

    const tile1 = initMatrix(1, 2, 2);

    expect(() => {
      renderTileOnScreen(screen, tile1, 3, 3);
    }).toThrow("tile out of range");
  });

  test("render mushroom word", () => {
    nes = createMushroomWord();

    const [world, nesWorld] = renderBackGround(nes);

    nes = nesWorld;

    const [arr, colorNes] = readRangeVRam(0x3f00, 8, nes);

    nes = colorNes;

    const [mushRoom, nesMushroom] = readRangeVRam(0x2360, 0x20, nes);

    nes = nesMushroom;

    const [green, nesGreen] = readRangeVRam(0x2380, 0x20, nes);

    nes = nesGreen;

    const [ground, nesGround] = readRangeVRam(0x23a0, 0x20, nes);

    nes = nesGround;

    expect(arr).toStrictEqual([0x3f, 0x28, 0x16, 0x27, 0x3f, 0x8, 0x9, 0x18]);
    expect(mushRoom).toStrictEqual(repeat(32).map((_) => 1));
    expect(green).toStrictEqual(repeat(32).map((_) => 2));
    expect(ground).toStrictEqual(repeat(32).map((_) => 3));

    const [att, attNes] = renderAttributeTable(nes);

    nes = attNes;

    expect(att[28]).toStrictEqual(repeat(32).map((_) => 1));
    expect(att[29]).toStrictEqual(repeat(32).map((_) => 1));
  });
});
