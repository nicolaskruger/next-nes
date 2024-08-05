import { RefObject } from "react";
import { rgb } from "../ppu/color/color";
import { INVISIBLE_TILE } from "../ppu/render/render";
import { hexToDex } from "../helper/converter";

type CanvasRef = RefObject<HTMLCanvasElement>;

export const getCanvas = (ref: CanvasRef) => ref.current as HTMLCanvasElement;

export const getCanvasContext = (ref: CanvasRef) =>
  getCanvas(ref).getContext("2d") as CanvasRenderingContext2D;

export const renderMultiply = (
  screen: string[][],
  canvas: CanvasRef,
  multiply: number
) => {
  for (let y = 0; y < screen.length; y++)
    for (let x = 0; x < screen[y].length; x++) {
      getCanvasContext(canvas).fillStyle = screen[y][x];
      getCanvasContext(canvas).fillRect(
        x * multiply,
        y * multiply,
        multiply,
        multiply
      );
    }
};

export const render = (screen: string[][], canvas: CanvasRef) => {
  for (let y = 0; y < screen.length; y++)
    for (let x = 0; x < screen[y].length; x++) {
      getCanvasContext(canvas).fillStyle = screen[y][x];
      getCanvasContext(canvas).fillRect(x, y, 1, 1);
    }
};

export const makeInvisibleTile = (canvas: CanvasRef, multi: number) => {
  const ctx = getCanvasContext(canvas);
  const imgData = ctx.getImageData(0, 0, 8 * multi, 8 * multi);

  const pix = imgData.data;

  for (let i = 0; i < pix.length; i += 4) {
    if (
      rgb(pix[i], pix[i + 1], pix[i + 2]) === hexToDex(INVISIBLE_TILE.slice(1))
    ) {
      pix[i + 3] = 0;
    }
  }

  ctx.putImageData(imgData, 0, 0);
};

export const renderPixel = (
  pixel: string,
  x: number,
  y: number,
  canvas: CanvasRef,
  multiply?: number
) => {
  const mult = multiply ? multiply : 1;
  getCanvasContext(canvas).fillStyle = pixel;
  getCanvasContext(canvas).fillRect(x * mult, y * mult, mult, mult);
};
