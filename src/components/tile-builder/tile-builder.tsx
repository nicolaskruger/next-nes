import { multiplyMatrix } from "@/nes/helper/multiply-matrix";
import { repeat } from "@/nes/helper/repeat";
import { Nes } from "@/nes/nes";
import { renderTile } from "@/nes/ppu/render/render";
import { render } from "@/nes/render/render";
import { RefObject, useEffect, useRef } from "react";

type TileBuilderProps = {
  imgs: RefObject<HTMLImageElement>[];
  multi: number;
  nes: Nes;
  canvas: RefObject<HTMLCanvasElement>;
  refresh: () => void;
};

export const PrerenderBuilder = ({
  imgs,
  multi,
  nes,
  canvas,
  refresh,
}: TileBuilderProps) => {
  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <canvas
        className="hidden"
        ref={canvas}
        width={multi * 8}
        height={multi * 8}
      />
      <div className="flex flex-wrap ">
        {imgs.map((img, key) => (
          <img key={key} ref={img} />
        ))}
      </div>
    </div>
  );
};
