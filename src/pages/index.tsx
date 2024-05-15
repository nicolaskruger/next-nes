import { HEIGHT, WIDTH } from "@/constants/size";
import { useControl } from "@/hooks/control/control";
import { useGameLoop } from "@/hooks/game-loop/game-loop";
import { useMult } from "@/hooks/mult/mult";
import { createMushroomWord } from "@/nes/debug/background-creator";
import { multiplyMatrix } from "@/nes/helper/multiply-matrix";
import { renderScreen } from "@/nes/ppu/render/render";
import { render } from "@/nes/render/render";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mult = useMult();
  const { nes, controlProps } = useGameLoop(createMushroomWord());

  useEffect(() => {
    render(multiplyMatrix(renderScreen(nes)[0], mult), canvasRef);
  }, [mult]);
  return (
    <main
      {...controlProps}
      className="w-screen h-screen flex justify-center items-center"
    >
      <canvas ref={canvasRef} width={WIDTH * mult} height={HEIGHT * mult} />
    </main>
  );
}
