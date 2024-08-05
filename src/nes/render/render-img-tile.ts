import { MutableRefObject, RefObject } from "react";
import { Nes } from "../nes";
import { getCanvas, getCanvasContext } from "./render";
import {
  getBgColor,
  NameTableReturn,
  renderAttributeTable,
  renderNameTable,
} from "../ppu/render/render";
import { repeat } from "../helper/repeat";
import { readSprInfo, SprInfo } from "../ppu/spr-ram/spr-ram";
import { HEIGHT, WIDTH } from "@/constants/size";
import { isShowBg, isShowSpr } from "../ppu/registers/registers";
import { readNameTable } from "../ppu/vram/vram";
import { getScrollX, getScrollY } from "../ppu/scroll/scroll";

type GetImage = (tile: number, pallet: number) => RefObject<HTMLImageElement>;

type CanvasRef = RefObject<HTMLCanvasElement>;

const getAll = (
  nes: Nes,
  get: (nes: Nes, index: number) => NameTableReturn
) => {
  let [nameTable0, nes0] = get(nes, 0);
  let [nameTable1, nes1] = get(nes0, 1);
  let [nameTable2, nes2] = get(nes1, 1);
  let [nameTable3, nes3] = get(nes2, 1);

  nameTable0 = nameTable0.map((name, i) => [...name, ...nameTable1[i]]);
  nameTable2 = nameTable2.map((name, i) => [...name, ...nameTable3[i]]);
  nameTable0 = [...nameTable0, ...nameTable2];

  return [nameTable0, nes3] as const;
};

const getAllNameTable = (nes: Nes) => {
  return getAll(nes, renderNameTable);
};

const getAllAtributeTable = (nes: Nes) => getAll(nes, renderAttributeTable);

const renderAllSelectScreen = (
  nes: Nes,
  index: number,
  getImage: GetImage,
  multi: number,
  canvas: CanvasRef
): Nes => {
  const [nameTable, nesNameTable] = getAllNameTable(nes);
  const [attributeTable, nesAttributeTable] = getAllAtributeTable(nesNameTable);

  const attributeTableBgIndex = (index: number) => 0x3f00 + 4 * index;

  const ctx = getCanvasContext(canvas);

  const _x = getScrollX(nesAttributeTable);
  const _y = getScrollY(nesAttributeTable);

  console.log({
    _x,
    _y,
  });

  const start = (x: number) => Math.floor(x / 8);

  const end = (x: number, length: number) =>
    length + start(x) + (x % 8 !== 0 ? 1 : 0);

  for (let y = start(_y); y < end(_y, 30); y++)
    for (let x = start(_x); x < end(_x, 32); x++) {
      const tileIndex = nameTable[y][x] * 0x10;
      const palletIndex = attributeTableBgIndex(attributeTable[y][x]);
      ctx.drawImage(
        getImage(tileIndex, palletIndex).current as HTMLImageElement,
        8 * multi * x - _x * multi,
        8 * multi * y - _y * multi
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
  if (showBg) _nes = renderAllSelectScreen(_nes, 0, getImage, multi, canvas);
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
