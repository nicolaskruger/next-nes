import { repeat } from "@/nes/helper/repeat";
import { getCanvasContext } from "@/nes/render/render";
import { createRef, RefObject, useEffect, useState } from "react";
import { clearInterval } from "timers";

type Props = {
  imgs: RefObject<HTMLImageElement>[];
  getTile: (tile: number, pallet: number) => RefObject<HTMLImageElement>;
};

const size = 0x2000 / 0x10;
const multi = 2;

export const RenderTiles = ({ imgs, getTile }: Props) => {
  const canvas = repeat(imgs.length).map((_) => createRef<HTMLCanvasElement>());

  const [src, setSrc] = useState("");
  //   useEffect(() => {
  //     const interval = setInterval(() => {
  //       getCanvasContext(canvas[i]).drawImage(
  //         imgs[i * 8].current as HTMLImageElement,
  //         0,
  //         0
  //       );
  //       setI((i + 1) % canvas.length);
  //     }, 100);

  //     return () => {
  //       clearInterval(interval);
  //     };
  //   }, []);

  const render = () => {
    canvas
      .map((c) => getCanvasContext(c))
      .forEach((c, i) =>
        c.drawImage(getTile(0x0010, 0x3f00).current as HTMLImageElement, 0, 0)
      );
    setSrc(getTile(0x0010, 0x3f04).current?.src || "");
  };

  return (
    <div className="flex flex-wrap justify-center items-center">
      {canvas.map((c, i) => (
        <canvas key={i} ref={c} width={8 * multi} height={8 * multi} />
      ))}
      <button onClick={render}>render</button>
      <img src={src} />
    </div>
  );
};
