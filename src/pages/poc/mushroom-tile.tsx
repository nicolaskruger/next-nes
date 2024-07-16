import { colorCreator } from "@/nes/debug/color-creeator";
import {
  createGreenGround,
  createGround,
  createMushroomTile,
} from "@/nes/debug/tile-creator";
import { multiplyMatrix } from "@/nes/helper/multiply-matrix";
import { initNes } from "@/nes/nes";
import { renderTile } from "@/nes/ppu/render/render";
import { render } from "@/nes/render/render";
import { useEffect, useRef, useState } from "react";

export default function MushRoomTile() {
  const canvasMushroom = useRef<HTMLCanvasElement>(null);
  const canvasGround = useRef<HTMLCanvasElement>(null);
  const canvasGreenGround = useRef<HTMLCanvasElement>(null);

  const img = useRef<HTMLImageElement>();

  useEffect(() => {
    let nes = initNes();

    nes = colorCreator(0x3f00, nes, 0x3f, 0x28, 0x16, 0x27);
    nes = colorCreator(0x3f04, nes, 0x3f, 0x8, 0x9, 0x18);
    nes = createMushroomTile(0, nes);
    nes = createGround(0x10, nes);
    nes = createGreenGround(0x20, nes);
    const [mushRom] = renderTile(nes, 0, 0x3f00);
    const [ground] = renderTile(nes, 0x1, 0x3f04);
    const [green] = renderTile(nes, 0x2, 0x3f04);

    render(multiplyMatrix(mushRom, 10), canvasMushroom);
    render(multiplyMatrix(ground, 10), canvasGround);
    render(multiplyMatrix(green, 10), canvasGreenGround);

    img!.current!.src = canvasMushroom.current?.toDataURL() as string;
  }, []);

  return (
    <>
      <canvas className="hidden" ref={canvasMushroom} width={80} height={80} />
      <canvas ref={canvasGreenGround} width={80} height={80} />
      <canvas ref={canvasGround} width={80} height={80} />
      <img ref={img} alt="" />
    </>
  );
}
