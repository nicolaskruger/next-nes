import { RefObject } from "react";
import { Nes } from "../nes";
import { repeat } from "../helper/repeat";
import { HEIGHT, WIDTH } from "@/constants/size";
import { getCanvasContext } from "./render";

type GetImage = (tile: number, pallet: number) => RefObject<HTMLImageElement>;

type CanvasRef = RefObject<HTMLCanvasElement>;

const GRID = 8 * 8;

export const render = (
  nes: Nes,
  getImage: GetImage,
  multi: number,
  canvas: CanvasRef
): Nes => {
  const ctx = getCanvasContext(canvas);

  repeat((WIDTH * HEIGHT) / GRID).forEach((_, i) => {
    ctx.drawImage(
      getImage(0x0040, 0x3f00).current as HTMLImageElement,
      8 * multi * (i % (WIDTH / 8)),
      8 * multi * Math.floor(i / (WIDTH / 8))
    );
  });

  return nes;
};
