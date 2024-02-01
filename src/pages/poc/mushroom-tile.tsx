import { tileCreator } from "@/nes/debug/tile-creator";
import { multiplyMatrix } from "@/nes/helper/multiply-matrix";
import { Nes, initNes } from "@/nes/nes";
import { renderTile } from "@/nes/ppu/render/render";
import { writeVRam } from "@/nes/ppu/vram/vram";
import { render } from "@/nes/render/render";
import { useEffect, useRef } from "react";

const binaryToInt = (binary: string) => parseInt(binary, 2);

const writeVRamBinary = (addr: number, binary: string, nes: Nes) =>
  writeVRam(addr, binaryToInt(binary), nes);

export default function MushRoomTile() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let nes = initNes();

    nes = writeVRam(0x3f00, 0x3f, nes);
    nes = writeVRam(0x3f01, 0x28, nes);
    nes = writeVRam(0x3f02, 0x16, nes);
    nes = writeVRam(0x3f03, 0x27, nes);

    nes = tileCreator(
      0,
      [
        [0, 0, 2, 2, 2, 2, 0, 0],
        [0, 2, 2, 2, 2, 2, 2, 0],
        [0, 2, 2, 2, 2, 2, 2, 0],
        [2, 2, 2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 2, 2, 2, 2],
        [0, 3, 1, 1, 1, 1, 3, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
      ],
      nes
    );

    const [tile] = renderTile(nes, 0, 0x3f00);

    render(multiplyMatrix(tile, 10), canvasRef);
  }, []);

  return <canvas ref={canvasRef} width={80} height={80} />;
}
