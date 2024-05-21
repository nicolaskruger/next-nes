import { HEIGHT, WIDTH } from "@/constants/size";
import { useCoordinates } from "@/hooks/coodinates/coordinates";
import { Nes } from "@/nes/nes";
import { renderScreen } from "@/nes/ppu/render/render";
import { renderPixel } from "@/nes/render/render";
import { RefObject, useEffect, useRef, useState } from "react";

type Coordinate = {
  x: number;
  y: number;
};

const slice = (WIDTH * HEIGHT) / 10;

const generateCoordinateComb = () => {
  const coords: Coordinate[] = [];
  for (let y = 0; y < HEIGHT; y++)
    for (let x = 0; x < WIDTH; x++) coords.push({ x, y });
  return coords;
};

const COORDS = generateCoordinateComb();

type PropsRenderNes = {
  nes: Nes;
  mult?: number;
  canvasRef: RefObject<HTMLCanvasElement>;
};
export const RenderNes = ({ nes, mult, canvasRef }: PropsRenderNes) => {
  const _mult = mult ? mult : 1;
  const [countRender, setCountRender] = useState(0);
  const [screen, setScreen] = useState(renderScreen(nes)[0]);
  const [countScreen, setCountScreen] = useState(0);

  useEffect(() => {
    setCountScreen((c) => ++c % 10);
    if (countScreen === 0) setScreen(renderScreen(nes)[0]);
  }, [nes]);

  useEffect(() => {
    const c = countRender;
    const promises = COORDS.slice(c * slice, (c + 1) * slice).map(
      ({ x, y }) =>
        new Promise((res) =>
          res(renderPixel(screen[y][x], x, y, canvasRef, mult))
        )
    );
    Promise.all(promises);
    setCountRender((countRender + 1) % 10);
  }, [nes, mult]);

  return (
    <canvas ref={canvasRef} width={WIDTH * _mult} height={HEIGHT * _mult} />
  );
};
