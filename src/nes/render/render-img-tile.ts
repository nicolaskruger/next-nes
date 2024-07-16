import { RefObject } from "react";
import { Nes } from "../nes";
import { getCanvasContext } from "./render";
import { renderAttributeTable, renderNameTable } from "../ppu/render/render";

type GetImage = (tile: number, pallet: number) => RefObject<HTMLImageElement>;

type CanvasRef = RefObject<HTMLCanvasElement>;

const renderSelectScreen = (
  nes: Nes,
  index: number,
  getImage: GetImage,
  multi: number,
  canvas: CanvasRef
): Nes => {
  const [nameTable, nesNameTable] = renderNameTable(nes, index);
  const [attributeTable, nesAttributeTable] = renderAttributeTable(
    nesNameTable,
    index
  );

  const attributeTableBgIndex = (index: number) => 0x3f00 + 4 * index;

  const ctx = getCanvasContext(canvas);

  for (let y = 0; y < nameTable.length; y++)
    for (let x = 0; x < nameTable[y].length; x++) {
      const tileIndex = nameTable[y][x] * 0x10;
      const palletIndex = attributeTableBgIndex(attributeTable[y][x]);
      ctx.drawImage(
        getImage(tileIndex, palletIndex).current as HTMLImageElement,
        8 * multi * x,
        8 * multi * y
      );
    }
  return nesAttributeTable;
};

export const render = (
  nes: Nes,
  getImage: GetImage,
  multi: number,
  canvas: CanvasRef
): Nes => {
  let _nes = renderSelectScreen(nes, 0, getImage, multi, canvas);

  return _nes;
};
