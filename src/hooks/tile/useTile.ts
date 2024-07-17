import { multiplyMatrix } from "@/nes/helper/multiply-matrix";
import { repeat } from "@/nes/helper/repeat";
import { Nes } from "@/nes/nes";
import { renderTile } from "@/nes/ppu/render/render";
import { render } from "@/nes/render/render";
import { createRef, RefObject, useRef, useState } from "react";

const size = (8 * 0x2000) / 0x10;

export const usePrerender = (nes: Nes, multi: number) => {
  const canvas = useRef<HTMLCanvasElement>(null);

  const [imgs, setImgs] = useState<RefObject<HTMLImageElement>[]>(
    repeat(size).map((_) => createRef<HTMLImageElement>())
  );

  const getTile = (tile: number, pallet: number) =>
    imgs[8 * Math.floor(tile / 0x10) + Math.floor((pallet - 0x3f00) / 4)];

  const refresh = () => {
    const start = performance.now();
    imgs
      .map((img, i) => ({
        tile: renderTile(nes, Math.floor(i / 8), 0x3f00 + 0x4 * (i % 8))[0],
        img,
      }))
      .forEach(({ tile, img }) => {
        render(multiplyMatrix(tile, multi), canvas);
        img!.current!.src = canvas.current?.toDataURL() as string;
      });
    const finish = performance.now();
    console.log(finish - start);
  };

  return {
    getTile,
    imgs,
    refresh,
    multi,
    nes,
  };
};
