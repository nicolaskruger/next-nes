import { RefObject } from "react";

type CanvasRef = RefObject<HTMLCanvasElement>;

const getCanvas = (ref: CanvasRef) => ref.current as HTMLCanvasElement;

const getCanvasContext = (ref: CanvasRef) =>
  getCanvas(ref).getContext("2d") as CanvasRenderingContext2D;

export const render = (screen: string[][], canvas: CanvasRef) => {
  for (let y = 0; y < screen.length; y++)
    for (let x = 0; x < screen[y].length; x++) {
      getCanvasContext(canvas).fillStyle = screen[y][x];
      getCanvasContext(canvas).fillRect(x, y, 1, 1);
    }
};
