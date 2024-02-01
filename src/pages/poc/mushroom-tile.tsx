import { colorCreator } from "@/nes/debug/color-creeator";
import { createMushroomTile, tileCreator } from "@/nes/debug/tile-creator";
import { multiplyMatrix } from "@/nes/helper/multiply-matrix";
import { Nes, initNes } from "@/nes/nes";
import { renderTile } from "@/nes/ppu/render/render";
import { writeVRam } from "@/nes/ppu/vram/vram";
import { render } from "@/nes/render/render";
import { useEffect, useRef } from "react";

export default function MushRoomTile() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let nes = initNes();

    nes = colorCreator(0x3f00, nes, 0x3f, 0x28, 0x16, 0x27);
    nes = createMushroomTile(0, nes);

    const [tile] = renderTile(nes, 0, 0x3f00);

    render(multiplyMatrix(tile, 10), canvasRef);
  }, []);

  return <canvas ref={canvasRef} width={80} height={80} />;
}
