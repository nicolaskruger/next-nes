import { Code } from "@/components/code/code.spec";
import { RenderNes } from "@/components/render-nes/reder-nes";
import { useMult } from "@/hooks/mult/mult";
import {
  decompileNes,
  findCurrentInstruction,
} from "@/nes/cpu/decompiler/decompile";
import { createMushroomWord } from "@/nes/debug/background-creator";
import { useRef, useState } from "react";

export default function Decompile() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mult = useMult({ H: 1, W: 2 / 3 });
  const [nes] = useState(createMushroomWord());

  const prog = decompileNes(nes);
  const currIns = findCurrentInstruction(nes, prog);

  return (
    <main className="flex w-screen h-screen">
      <div className="w-1/3 flex-col flex">
        <div className="w-full h-2/3 bg-blue-500 overflow-y-scroll pl-3">
          <Code currIns={currIns} dec={prog} />
        </div>
        <div className="w-full h-1/3 bg-red-500"></div>
      </div>
      <div className="w-2/3 bg-purple-500 flex items-center justify-center">
        <RenderNes nes={nes} canvasRef={canvasRef} mult={mult} />
      </div>
    </main>
  );
}
