import { multiplyMatrix } from "@/nes/helper/multiply-matrix";
import { repeat } from "@/nes/helper/repeat";
import { Nes } from "@/nes/nes";
import { renderTile } from "@/nes/ppu/render/render";
import { render } from "@/nes/render/render";
import { createRef, RefObject, useRef, useState } from "react";

const size = (8 * 0x2000) / 0x10;

type Refresh = {
  imgIndex: number;
  tileIndex: number;
  palletIndex: number;
};

const REFRESH: Refresh[] = repeat(size).map((_, i) => ({
  imgIndex: i,
  tileIndex: Math.floor(i / 8),
  palletIndex: 0x3f00 + 0x4 * (i % 8),
}));

export const usePrerender = (nes: Nes, multi: number) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [percent, setPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  let refreshList: Refresh[] = [];
  let refreshInterval: NodeJS.Timeout | null = null;
  const [imgs, setImgs] = useState(
    repeat(size).map((_) => createRef<HTMLImageElement>())
  );

  const getTile = (tile: number, pallet: number) =>
    imgs[8 * Math.floor(tile / 0x10) + Math.floor((pallet - 0x3f00) / 4)];

  const compRefresh = (a: Refresh, b: Refresh) =>
    Object.keys(a).every(
      (key) => a[key as keyof Refresh] === b[key as keyof Refresh]
    );

  const startRefreshInterval = () => {
    const REFRESH_SIZE = 32;

    if (refreshInterval) return;
    setLoading(true);
    refreshInterval = setInterval(() => {
      if (refreshList.length === 0) {
        clearInterval(refreshInterval!);
        refreshInterval = null;
        setLoading(false);
        return;
      }
      const rList = refreshList.slice(0, REFRESH_SIZE);
      rList.forEach(({ imgIndex, palletIndex, tileIndex }) => {
        const tile = renderTile(nes, tileIndex, palletIndex)[0];
        render(multiplyMatrix(tile, multi), canvas);
        imgs[imgIndex]!.current!.src = canvas.current?.toDataURL() as string;
      });
      refreshList = refreshList.slice(REFRESH_SIZE);
      setImgs([...imgs]);
      setPercent((100 * (imgs.length - refreshList.length)) / imgs.length);
    }, 1);
  };

  const pushRefreshList = (refresh: Refresh) => {
    refreshList = [
      ...refreshList.filter((a) => compRefresh(a, refresh)),
      refresh,
    ];
    startRefreshInterval();
  };

  const refresh = () => {
    refreshList = REFRESH;
    startRefreshInterval();
  };

  const refreshPallet = (address: number) => {
    setLoading(true);
    setPercent(0);
    const index = Math.floor((address - 0x3f00) / 4);
    imgs.forEach((imgs, i) => {
      if (i % 8 === index)
        pushRefreshList({
          imgIndex: i,
          tileIndex: Math.floor(i / 8),
          palletIndex: 0x3f00 + 0x4 * (i % 8),
        });
    });
  };

  return {
    getTile,
    imgs,
    refresh,
    multi,
    nes,
    canvas,
    refreshPallet,
    loading,
    percent,
  };
};
