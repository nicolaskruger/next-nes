import { multiplyMatrix } from "@/nes/helper/multiply-matrix";
import { Nes } from "@/nes/nes";
import { renderTile } from "@/nes/ppu/render/render";
import { SprInfo } from "@/nes/ppu/spr-ram/spr-ram";
import { makeInvisibleTile, render } from "@/nes/render/render";
import { useEffect, useRef, useState } from "react";

type Dictionary<T extends string | symbol | number, U> = {
  [K in T]: U;
};

export type GetSprite = (
  sprite: Omit<SprInfo, "x" | "y" | "bgPos">
) => HTMLImageElement;

export const usePrerender = (nes: Nes, multi: number) => {
  const canvas = useRef<HTMLCanvasElement>({} as HTMLCanvasElement);
  const blankImg = useRef<ImageData>();
  const sprites = useRef<Dictionary<string, HTMLImageElement>>({});

  useEffect(() => {
    const startCanvas = () => {
      canvas.current = document.createElement("canvas");
      canvas.current.width = multi * 8;
      canvas.current.height = multi * 8;
    };
    const startBlankImg = () => {
      const img = canvas.current
        .getContext("2d")!
        .getImageData(0, 0, 8 * multi, 8 * multi);
      img.data.forEach((_, i, arr) => {
        if (i % 4 === 3) arr[i] = 0;
      });
      blankImg.current = img;
    };

    [startCanvas, startBlankImg].forEach((callback) => callback());
  }, []);

  const getTile = (tile: number, pallet: number) => {
    return getSprite({
      tile,
      pallet,
      verticalMirror: false,
      horizontalMirror: false,
    });
  };

  const mirror = (tile: string[][], vertical: boolean, horizontal: boolean) => {
    if (vertical)
      return mirror(
        tile.map((t) => t.reverse()),
        false,
        horizontal
      );
    if (horizontal) return mirror(tile.reverse(), vertical, false);
    return tile;
  };

  const getSprite = (sprite: Omit<SprInfo, "x" | "y" | "bgPos">) => {
    const { tile, pallet, horizontalMirror, verticalMirror } = sprite;
    const generateKey = () =>
      [tile, pallet, horizontalMirror, verticalMirror]
        .map((v) => v.toString())
        .join(":");
    const key = generateKey();
    let img = sprites.current[key];
    if (img) return img;
    const renderedTile = mirror(
      renderTile(nes, Math.floor(tile / 0x10), pallet)[0],
      verticalMirror,
      horizontalMirror
    );
    render(multiplyMatrix(renderedTile, multi), canvas);
    makeInvisibleTile(canvas, multi);
    sprites.current[key] = new Image();
    sprites.current[key]!.src = canvas.current?.toDataURL() as string;
    return sprites.current[key];
  };

  const refresh = () => {
    Object.keys(sprites.current).forEach((key) => {
      delete sprites.current[key];
    });
  };

  const refreshPallet = (address: number) => {};

  return {
    getTile,
    getSprite,
    refresh,
    multi,
    nes,
    refreshPallet,
    clearTile: blankImg,
  };
};
