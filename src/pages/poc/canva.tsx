import { COLOR_PALLET, colorToHex } from "@/nes/ppu/color/color";
import { RefObject, useCallback, useEffect, useRef } from "react";

type CanvasRef = RefObject<HTMLCanvasElement>;

const getCanvas = (ref: CanvasRef) => ref.current as HTMLCanvasElement;

const getCanvasContext = (ref: CanvasRef) =>
  getCanvas(ref).getContext("2d") as CanvasRenderingContext2D;

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    for (let i = 0; i < 256 * 240; i++) {
      getCanvasContext(canvasRef).fillStyle = colorToHex(
        Math.floor(Math.random() * COLOR_PALLET.length)
      );
      getCanvasContext(canvasRef)?.fillRect(i % 256, Math.floor(i / 256), 1, 1);
    }
  }, [canvasRef]);
  useEffect(() => {
    const id = setInterval(() => draw(), 1);
    return () => clearInterval(id);
  }, [draw]);

  return <canvas ref={canvasRef} width={256} height={240} />;
}
