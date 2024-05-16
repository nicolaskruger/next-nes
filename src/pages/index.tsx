import { HEIGHT, WIDTH } from "@/constants/size";
import { useControl } from "@/hooks/control/control";
import { useGameLoop } from "@/hooks/game-loop/game-loop";
import { useMult } from "@/hooks/mult/mult";
import { createMushroomWord } from "@/nes/debug/background-creator";
import { multiplyMatrix } from "@/nes/helper/multiply-matrix";
import { renderScreen } from "@/nes/ppu/render/render";
import { render } from "@/nes/render/render";
import { rom } from "@/nes/rom/rom";
import { ChangeEvent, useEffect, useRef, useState } from "react";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mult = useMult();
  const { nes, controlProps, setNes } = useGameLoop(createMushroomWord());
  const handleChangeRom = async (e: ChangeEvent<HTMLInputElement>) => {
    const _nes = await rom(nes, e?.target?.files?.[0] as File);
    setNes(_nes);
  };

  useEffect(() => {
    render(multiplyMatrix(renderScreen(nes)[0], mult), canvasRef);
  }, [mult, nes]);
  return (
    <main
      {...controlProps}
      className="w-screen h-screen flex justify-center items-center flex-col space-y-1"
    >
      <input type="file" name="rom" id="rom" onChange={handleChangeRom} />
      <canvas ref={canvasRef} width={WIDTH * mult} height={HEIGHT * mult} />
    </main>
  );
}
