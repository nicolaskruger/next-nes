import { HEIGHT, WIDTH } from "@/constants/size";
import { multiplyMatrix } from "@/nes/helper/multiply-matrix";
import { Nes } from "@/nes/nes";
import { renderScreen } from "@/nes/ppu/render/render";
import { render } from "@/nes/render/render";
import { RefObject, useEffect, useRef } from "react";

type PropsRenderNes = {
  nes: Nes;
  mult?: number;
  canvasRef: RefObject<HTMLCanvasElement>;
};
export const RenderNes = ({ nes, mult, canvasRef }: PropsRenderNes) => {
  const _mult = mult ? mult : 1;
  useEffect(() => {
    render(multiplyMatrix(renderScreen(nes)[0], _mult), canvasRef);
  }, [mult, nes]);
  return (
    <canvas ref={canvasRef} width={WIDTH * _mult} height={HEIGHT * _mult} />
  );
};
