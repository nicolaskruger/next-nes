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
};

export const TileBuilder = ({ imgs, multi, nes }: TileBuilderProps) => {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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
  }, []);

  return (
    <div>
      <canvas
        className="hidden"
        ref={canvas}
        width={multi * 8}
        height={multi * 8}
      />
      <div className="flex flex-wrap">
        {imgs.map((img, key) => (
          <img key={key} ref={img} />
        ))}
      </div>
    </div>
  );
};
