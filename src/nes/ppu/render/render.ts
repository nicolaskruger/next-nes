import { Nes } from "@/nes/nes";
import { getAttributeTable, getNameTable } from "../registers/registers";
import { readAttributeTable, readNameTable } from "../vram/vram";
import { repeat } from "@/nes/helper/repeat";

export type NameTable = number[][];
export type NameTableReturn = [NameTable, Nes];
export type AttributeTable = NameTable;
export type AttributeTableReturn = NameTableReturn;

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
  repeat(4).map((_, index) => (binary >> (3 - index)) & ((1 << 1) | 1));

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
      const line = 15;
      const [a, b, c, d] = splitBinary(curr);
      const getIndex = () => [
        { y: Math.floor(index / line), x: index * colum, value: a },
        { y: Math.floor(index / line), x: index * colum + 1, value: b },
        { y: Math.floor(index / line) + 1, x: index * colum, value: c },
        { y: Math.floor(index / line) + 1, x: index * colum + 1, value: d },
      ];

      return getIndex().reduce((att, { value, x, y }) => {
        att[y][x] = value;
        return att;
      }, acc as AttributeTable);
    },
    attributeTable as AttributeTable
  );
};
