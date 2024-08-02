import { RefObject } from "react";
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

const renderSprites = (
  nes: Nes,
  canvas: CanvasRef,
  getImage: GetImage,
  multi: number,
  sprCanvas: CanvasRef
): Nes => {
  const ctx = getCanvasContext(canvas);

  const sprCtx = getCanvasContext(sprCanvas);

  return repeat(64).reduce((acc, curr, index) => {
    const [sprInfo, _nes] = readSprInfo(index, acc);

    const { tile, pallet, x, y, verticalMirror, horizontalMirror } =
      formatSprInfo(sprInfo, multi);

    const img = getImage(tile, pallet).current as HTMLImageElement;

    if (verticalMirror || horizontalMirror) {
      sprCtx.save();
      sprCtx.scale(-1, 1);
      sprCtx.drawImage(img, -img.width, 0);
      const newImg = new Image();
      newImg.src = sprCanvas.current?.toDataURL() || "";
      sprCtx.restore();
      ctx.drawImage(newImg, x, y);
    } else {
      ctx.drawImage(img, x, y);
    }

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
  sprCanvas: CanvasRef
): Nes => {
  let _nes = renderBg(nes, multi, canvas);
  const [showBg] = isShowBg(_nes);
  if (showBg) _nes = renderSelectScreen(_nes, 0, getImage, multi, canvas);
  const [showSpr] = isShowSpr(_nes);
  if (showSpr) _nes = renderSprites(_nes, canvas, getImage, multi, sprCanvas);
  return _nes;
};
