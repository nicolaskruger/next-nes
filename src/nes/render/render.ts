import { RefObject } from "react";

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
