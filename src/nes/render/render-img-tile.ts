import { MutableRefObject, RefObject } from "react";
import { Nes } from "../nes";
import { getCanvas, getCanvasContext } from "./render";
import {
  getBgColor,
  renderAttributeTable,
  renderNameTable,
} from "../ppu/render/render";
import { repeat } from "../helper/repeat";
import { readSprInfo, SprInfo } from "../ppu/spr-ram/spr-ram";
import { HEIGHT, WIDTH } from "@/constants/size";
import { isShowBg, isShowSpr } from "../ppu/registers/registers";

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

const formatSprInfo = (sprInfo: SprInfo, multi: number) => {
  sprInfo.tile *= 0x10;
  sprInfo.pallet = sprInfo.pallet * 4 + 0x3f10;
  sprInfo.x *= multi;
  sprInfo.y *= multi;
  return sprInfo;
};

const clearCtx = (
  canvas: CanvasRef,
  multi: number,
  clearTile: MutableRefObject<ImageData | undefined>
) => {
  const img = getCanvasContext(canvas).getImageData(0, 0, 8 * multi, 8 * multi);
  img.data.forEach((_, i, arr) => {
    if (i % 4 === 3) arr[i] = 0;
  });
  clearTile.current = img;
};

const renderSprites = (
  nes: Nes,
  canvas: CanvasRef,
  getImage: GetImage,
  multi: number,
  sprCanvas: CanvasRef,
  clearTile: MutableRefObject<ImageData>
): Nes => {
  const ctx = getCanvasContext(canvas);

  const sprCtx = getCanvasContext(sprCanvas);

  return repeat(64).reduce((acc, curr, index) => {
    const [sprInfo, _nes] = readSprInfo(index, acc);

    const { tile, pallet, x, y, verticalMirror } = formatSprInfo(
      sprInfo,
      multi
    );

    let img = getImage(tile, pallet).current as HTMLImageElement;

    if (verticalMirror) {
      sprCtx.putImageData(clearTile.current, 0, 0);
      sprCtx.save();
      sprCtx.scale(-1, 1);
      sprCtx.drawImage(img, -img.width, 0);
      img = new Image();
      img.src = sprCanvas.current?.toDataURL() || "";
      sprCtx.restore();
    }
    ctx.drawImage(img, x, y);

    return _nes;
  }, nes);
};

export const renderBg = (nes: Nes, multi: number, canvas: CanvasRef) => {
  const ctx = getCanvasContext(canvas);
  const [bgColor] = getBgColor(nes);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, WIDTH * multi, HEIGHT * multi);
  return nes;
};

export const render = (
  nes: Nes,
  getImage: GetImage,
  multi: number,
  canvas: CanvasRef,
  sprCanvas: CanvasRef,
  clearTile: MutableRefObject<ImageData | undefined>
): Nes => {
  let _nes = renderBg(nes, multi, canvas);
  if (clearTile.current === undefined) clearCtx(sprCanvas, multi, clearTile);
  const [showBg] = isShowBg(_nes);
  if (showBg) _nes = renderSelectScreen(_nes, 0, getImage, multi, canvas);
  const [showSpr] = isShowSpr(_nes);
  if (showSpr)
    _nes = renderSprites(
      _nes,
      canvas,
      getImage,
      multi,
      sprCanvas,
      clearTile as MutableRefObject<ImageData>
    );
  return _nes;
};
