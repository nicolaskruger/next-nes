import { multiplyMatrix } from "@/nes/helper/multiply-matrix";
import { repeat } from "@/nes/helper/repeat";
import { Nes } from "@/nes/nes";
import { renderTile } from "@/nes/ppu/render/render";
import { SprInfo } from "@/nes/ppu/spr-ram/spr-ram";
import { makeInvisibleTile, render } from "@/nes/render/render";
import { Result } from "postcss";
import { useEffect, useRef, useState } from "react";

const size = (8 * 0x2000) / 0x10;

type Dictionary<T extends string | symbol | number, U> = {
  [K in T]: U;
};

export type GetSprite = (
  sprite: Omit<SprInfo, "x" | "y" | "bgPos">
) => HTMLImageElement;

export const usePrerender = (nes: Nes, multi: number) => {
  const canvas = useRef<HTMLCanvasElement>({} as HTMLCanvasElement);
  const blankImg = useRef<ImageData>();
  const imgs = useRef<(HTMLImageElement | undefined)[]>([]);
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
    const startImgs = () => {
      imgs.current = repeat(size).map((_) => undefined);
    };

    [startCanvas, startBlankImg, startImgs].forEach((callback) => callback());
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
    const index =
      8 * Math.floor(tile / 0x10) + Math.floor((pallet - 0x3f00) / 4);
    const renderedTile = mirror(
      renderTile(nes, Math.floor(index / 8), 0x3f00 + 0x4 * (index % 8))[0],
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
    imgs.current = repeat(size).map((_) => undefined);
    Object.keys(sprites.current).forEach((key) => {
      delete sprites.current[key];
    });
  };

  const refreshPallet = (address: number) => {
    const index = Math.floor((address - 0x3f00) / 4);

    imgs.current = imgs.current.map((_, i) =>
      i % 8 === index ? undefined : _
    );
  };

  return {
    getTile,
    getSprite,
    imgs,
    refresh,
    multi,
    nes,
    refreshPallet,
    clearTile: blankImg,
  };
};
