import { Nes } from "@/nes/nes";
import { getAttributeTable, getNameTable } from "../registers/registers";
import {
  getTile,
  readAttributeTable,
  readNameTable,
  readVRam,
} from "../vram/vram";
import { repeat } from "@/nes/helper/repeat";
import { multiplyMatrix } from "@/nes/helper/multiply-matrix";
import { colorToHex } from "../color/color";

export type NameTable = number[][];
export type NameTableReturn = [NameTable, Nes];
export type AttributeTable = NameTable;
export type AttributeTableReturn = NameTableReturn;
export type Background = string[][];
export type BackgroundReturn = [Background, Nes];
export type Tile = string[][];

export const renderNameTable = (nes: Nes): NameTableReturn => {
  const [nameTableIndex, nesNameTableIndex] = getNameTable(nes);
  const [nameTableData, nesNameTable] = readNameTable(
    nameTableIndex,
    nesNameTableIndex
  );

  const nameTable: NameTable = repeat(30).reduce((acc, _, index) => {
    const getChunkSize = () => 0x20;
    const getStart = () => index * getChunkSize();
    const getFinish = () => getStart() + getChunkSize();
    return [...acc, nameTableData.slice(getStart(), getFinish())] as NameTable;
  }, [] as NameTable);

  return [nameTable, nesNameTable];
};

const splitBinary = (binary: number) =>
  repeat(4).map((_, index) => (binary >> (2 * index)) & ((1 << 1) | 1));

export const renderAttributeTable = (nes: Nes): AttributeTableReturn => {
  const [attributeTableIndex, nesAttributeTableIndex] = getAttributeTable(nes);

  const [attributeTableData, nesAttributeTable] = readAttributeTable(
    attributeTableIndex,
    nesAttributeTableIndex
  );

  const initAttributeTable = () =>
    repeat(15).map((_) => repeat(16).map((v) => 0));

  let attributeTable: AttributeTable = initAttributeTable();

  attributeTable = attributeTableData.reduce<AttributeTable>(
    (acc, curr, index) => {
      const colum = 16;
      const [a, b, c, d] = splitBinary(curr);
      const getNextX = () => ((index * 2) % colum) + 1;
      const getNextY = () => Math.floor((index * 2) / colum) * 2 + 1;
      const getCurrX = () => (index * 2) % colum;
      const getCurrY = () => Math.floor((index * 2) / colum) * 2;
      const isLastLine = () => index / 8 >= 7;
      const getIndex = () => [
        { y: getCurrY(), x: getCurrX(), value: a },
        { y: getCurrY(), x: getNextX(), value: b },
        { y: getNextY(), x: getCurrX(), value: c },
        { y: getNextY(), x: getNextX(), value: d },
      ];

      return getIndex()
        .slice(0, isLastLine() ? 2 : 4)
        .reduce((att, { value, x, y }) => {
          att[y][x] = value;
          return att;
        }, acc);
    },
    attributeTable
  );
  return [multiplyMatrix(attributeTable, 2), nesAttributeTable];
};

const getColors = (index: number, nes: Nes): [string[], Nes] => {
  const { colors, nes: _nes } = repeat(4).reduce(
    (acc, _, i) => {
      const [color, _nes] = readVRam(index + i, acc.nes);
      return {
        nes: _nes,
        colors: [...acc.colors, colorToHex(color)],
      };
    },
    { nes, colors: [] } as { nes: Nes; colors: string[] }
  );

  return [colors, nes];
};

export const renderTile = (
  nes: Nes,
  tileIndex: number,
  palletIndex: number
): [Tile, Nes] => {
  const [tile, nesTile] = getTile(tileIndex, nes);
  const [colors, nesColors] = getColors(palletIndex, nesTile);

  return [tile.map((line) => line.map((v) => colors[v])), nesColors];
};

export const initMatrix = <T>(
  value: T,
  xSize: number,
  ySize: number
): T[][] => {
  return repeat(ySize).map((_) => repeat(xSize).map((_) => value));
};

export const renderTileOnScreen = <T>(
  screen: T[][],
  tile: T[][],
  y: number,
  x: number
): T[][] => {
  const tileExceedsY = tile.length + y > screen.length;
  const tileExceedsX = tile[0].length + x > screen[0].length;
  if (tileExceedsX || tileExceedsY) throw new Error("tile out of range");
  for (let yTile = 0; yTile < tile.length; yTile++)
    for (let xTile = 0; xTile < tile[yTile].length; xTile++) {
      const xScreen = xTile + x;
      const yScreen = yTile + y;
      screen[yScreen][xScreen] = tile[yTile][xTile];
    }
  return screen;
};

export const renderBackGround = (nes: Nes): BackgroundReturn => {
  const [nameTable, nesNameTable] = renderNameTable(nes);
  const [attributeTable, nesAttributeTable] =
    renderAttributeTable(nesNameTable);
  const tileSize = 8;
  let screen = initMatrix("", 256, 240);

  let _nes = nesAttributeTable;
  for (let y = 0; y < nameTable.length; y++)
    for (let x = 0; x < nameTable[y].length; x++) {
      const tileIndex = nameTable[y][x];
      const palletIndex = attributeTable[y][x];
      const [tile, nesTile] = renderTile(_nes, tileIndex, palletIndex);
      const xScreen = x * tileSize;
      const yScreen = y * tileSize;
      _nes = nesTile;
      screen = renderTileOnScreen(screen, tile, yScreen, xScreen);
    }
  return [screen, _nes];
};
