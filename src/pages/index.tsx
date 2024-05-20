import { RenderNes } from "@/components/render-nes/reder-nes";
import { useGameLoop } from "@/hooks/game-loop/game-loop";
import { useMult } from "@/hooks/mult/mult";
import { createMushroomWord } from "@/nes/debug/background-creator";
import { rom } from "@/nes/rom/rom";
import { ChangeEvent, useRef } from "react";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mult = useMult();
  const { nes, controlProps, setNes } = useGameLoop(createMushroomWord());
  const handleChangeRom = async (e: ChangeEvent<HTMLInputElement>) => {
    const _nes = await rom(nes, e?.target?.files?.[0] as File);
    setNes(_nes);
  };
  return (
    <main
      {...controlProps}
      className="w-screen h-screen flex justify-center items-center flex-col space-y-1"
    >
      <input type="file" name="rom" id="rom" onChange={handleChangeRom} />
      <RenderNes nes={nes} mult={mult} canvasRef={canvasRef} />
    </main>
  );
}
