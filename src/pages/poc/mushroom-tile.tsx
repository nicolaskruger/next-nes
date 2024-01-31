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

    nes = writeVRamBinary(0x0000, "00000000", nes);
    nes = writeVRamBinary(0x0001, "00000000", nes);
    nes = writeVRamBinary(0x0002, "00000000", nes);
    nes = writeVRamBinary(0x0003, "00000000", nes);
    nes = writeVRamBinary(0x0004, "00000000", nes);
    nes = writeVRamBinary(0x0005, "00000000", nes);
    nes = writeVRamBinary(0x0006, "01111110", nes);
    nes = writeVRamBinary(0x0007, "00111100", nes);

    nes = writeVRamBinary(0x0008, "00111100", nes);
    nes = writeVRamBinary(0x0009, "01111110", nes);
    nes = writeVRamBinary(0x000a, "01111110", nes);
    nes = writeVRamBinary(0x000b, "11111111", nes);
    nes = writeVRamBinary(0x000c, "11111111", nes);
    nes = writeVRamBinary(0x000d, "11111111", nes);
    nes = writeVRamBinary(0x000e, "01000010", nes);
    nes = writeVRamBinary(0x000f, "00000000", nes);

    nes = writeVRam(0x3f00, 0x3f, nes);
    nes = writeVRam(0x3f01, 0x28, nes);
    nes = writeVRam(0x3f02, 0x16, nes);
    nes = writeVRam(0x3f03, 0x27, nes);

    const [tile] = renderTile(nes, 0, 0x3f00);

    render(tile, canvasRef);
  }, []);

  return <canvas ref={canvasRef} width={8} height={8} />;
}
