import { multiplyMatrix } from "@/nes/helper/multiply-matrix";
import { repeat } from "@/nes/helper/repeat";
import { Nes } from "@/nes/nes";
import { renderTile } from "@/nes/ppu/render/render";
import { makeInvisibleTile, render } from "@/nes/render/render";
import { useEffect, useRef, useState } from "react";

const size = (8 * 0x2000) / 0x10;

export const usePrerender = (nes: Nes, multi: number) => {
  const canvas = useRef<HTMLCanvasElement>({} as HTMLCanvasElement);
  const clearTile = useRef<ImageData>();
  const imgs = useRef<(HTMLImageElement | undefined)[]>([]);

  useEffect(() => {
    canvas.current = document.createElement("canvas");

    imgs.current = repeat(size).map((_) => undefined);
  }, []);

  const getTile = (tile: number, pallet: number) => {
    const index =
      8 * Math.floor(tile / 0x10) + Math.floor((pallet - 0x3f00) / 4);
    if (imgs.current[index]) {
      return imgs.current[index];
    }
    const renderedTile = renderTile(
      nes,
      Math.floor(index / 8),
      0x3f00 + 0x4 * (index % 8)
    )[0];
    render(multiplyMatrix(renderedTile, multi), canvas);
    makeInvisibleTile(canvas, multi);
    imgs.current[index] = new Image();
    imgs.current[index]!.src = canvas.current?.toDataURL() as string;
    return imgs.current[index];
  };

  const refresh = () => {
    imgs.current = repeat(size).map((_) => undefined);
  };

  const refreshPallet = (address: number) => {
    const index = Math.floor((address - 0x3f00) / 4);

    imgs.current = imgs.current.map((_, i) =>
      i % 8 === index ? undefined : _
    );
  };

  return {
    getTile,
    imgs,
    refresh,
    multi,
    nes,
    refreshPallet,
    clearTile,
  };
};
