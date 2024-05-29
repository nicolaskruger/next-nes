import { multiplyMatrix } from "@/nes/helper/multiply-matrix";
import { repeat } from "@/nes/helper/repeat";
import { Nes } from "@/nes/nes";
import { Tile, renderTile } from "@/nes/ppu/render/render";
import { render } from "@/nes/render/render";
import { RefObject, createRef, useEffect, useRef, useState } from "react";

type RenderTilesProps = {
  nes: Nes;
};

const size = 0x2000 / 0x10;
const multi = 2;

export const RenderTiles = ({ nes }: RenderTilesProps) => {
  const [canvas, setCanvas] = useState<RefObject<HTMLCanvasElement>[]>(
    repeat(size).map((_) => createRef<HTMLCanvasElement>())
  );

  const [tileList, setTileList] = useState<Tile[]>([]);

  useEffect(() => {
    const newTileList = repeat(size).map(
      (_, i) => renderTile(nes, i, 0x3f00)[0]
    );
    if (tileList.length === 0) {
      newTileList.forEach((c, i) => {
        render(multiplyMatrix(c, multi), canvas[i]);
      });
    } else {
      tileList.forEach((t, i) => {
        if (JSON.stringify(t) !== JSON.stringify(newTileList[i])) {
          render(multiplyMatrix(newTileList[i], multi), canvas[i]);
        }
      });
    }
    setTileList(newTileList);
  }, [nes]);

  return (
    <div className="flex flex-wrap justify-center items-center">
      {canvas.map((c, i) => (
        <canvas key={i} ref={canvas[i]} width={8 * multi} height={8 * multi} />
      ))}
    </div>
  );
};
