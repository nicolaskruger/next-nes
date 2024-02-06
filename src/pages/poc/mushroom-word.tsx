import { createMushroomWord } from "@/nes/debug/background-creator";
import { multiplyMatrix } from "@/nes/helper/multiply-matrix";
import { renderBackGround, renderScreen } from "@/nes/ppu/render/render";
import { render } from "@/nes/render/render";
import { useEffect, useRef } from "react";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const nes = createMushroomWord();
    render(multiplyMatrix(renderScreen(nes)[0], 2), canvasRef);
  }, []);

  return <canvas ref={canvasRef} width={256 * 2} height={240 * 2} />;
}
