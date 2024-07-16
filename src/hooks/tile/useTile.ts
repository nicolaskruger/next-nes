import { repeat } from "@/nes/helper/repeat";
import { createRef, RefObject, useState } from "react";

const size = (8 * 0x2000) / 0x10;

export const useTile = () => {
  const [imgs, setImgs] = useState<RefObject<HTMLImageElement>[]>(
    repeat(size).map((_) => createRef<HTMLImageElement>())
  );

  const getTile = (tile: number, pallet: number) =>
    imgs[8 * Math.floor(tile / 0x10) + Math.floor((pallet - 0x3f00) / 4)];

  return {
    getTile,
    imgs,
  };
};
