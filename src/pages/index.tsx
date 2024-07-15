import { RenderNes } from "@/components/render-nes/reder-nes";
import { useControl } from "@/hooks/control/control";
import { useGameLoop } from "@/hooks/game-loop/game-loop";
import { useMult } from "@/hooks/mult/mult";
import { writePadOne } from "@/nes/cpu/ controller/controller";
import { createMushroomWord } from "@/nes/debug/background-creator";
import { rom } from "@/nes/rom/rom";
import { tick } from "@/nes/tick";
import { ChangeEvent, useEffect, useRef, useState } from "react";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mult = useMult();
  // const { nes, controlProps, setNes } = useGameLoop(createMushroomWord());
  const [nes, setNes] = useState(createMushroomWord());
  const { control, ...props } = useControl();
  const [clock, setClock] = useState(0);
  let interval: NodeJS.Timeout;

  const handleChangeRom = async (e: ChangeEvent<HTMLInputElement>) => {
    const _nes = await rom(nes, e?.target?.files?.[0] as File);
    setNes(_nes);
    clearInterval(interval);
    interval = setInterval(() => {
      let nes0 = writePadOne(_nes, control);
      const { nes: nes1, cycles } = tick(nes0);
      setNes((nes) => tick(nes).nes);
    }, 0);
  };
  return (
    <main
      {...props}
      className="w-screen h-screen flex justify-center items-center flex-col space-y-1"
    >
      <input type="file" name="rom" id="rom" onChange={handleChangeRom} />
      <RenderNes nes={nes} mult={mult} canvasRef={canvasRef} />
    </main>
  );
}
