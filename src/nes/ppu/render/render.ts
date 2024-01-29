import { Nes } from "@/nes/nes";
import { getNameTable } from "../registers/registers";
import { readNameTable } from "../vram/vram";
import { repeat } from "@/nes/helper/repeat";

export type NameTable = number[][];
export type NameTableReturn = [NameTable, Nes];

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
