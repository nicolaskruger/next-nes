import { repeat } from "@/nes/helper/repeat";
import { getCanvasContext } from "@/nes/render/render";
import { createRef, RefObject, useEffect, useState } from "react";
import { clearInterval } from "timers";

type Props = {
  imgs: RefObject<HTMLImageElement>[];
  index?: number;
};

export const RenderTiles = ({ imgs, index }: Props) => {
  return (
    <div className="flex flex-wrap justify-center items-center">
      {imgs
        .filter((_, i) => i % 8 === index)
        .map((img, i) => (
          <img key={i} src={img.current?.src || ""} />
        ))}
    </div>
  );
};
