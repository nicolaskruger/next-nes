import { Code } from "@/components/code/code.spec";
import { RenderNes } from "@/components/render-nes/reder-nes";
import { useMult } from "@/hooks/mult/mult";
import {
  Decompile as Dec,
  decompileNes,
  findCurrentInstruction,
} from "@/nes/cpu/decompiler/decompile";
import { createMushroomWord } from "@/nes/debug/background-creator";
import { rom } from "@/nes/rom/rom";
import { tick } from "@/nes/tick";
import { ChangeEvent, useEffect, useRef, useState } from "react";

export default function Decompile() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mult = useMult({ H: 1, W: 2 / 3 });
  const [nes, setNes] = useState(createMushroomWord());
  const [prog, setProg] = useState<Dec>({ instruction: [], program: "" });
  const [currIns, setCurr] = useState(0);

  useEffect(() => {
    setProg(decompileNes(createMushroomWord()));
  }, []);

  const next = () => {
    const _nes = tick(nes).nes;
    setNes(_nes);
    setCurr(findCurrentInstruction(_nes, prog));
  };

  const handleChangeRom = async (e: ChangeEvent<HTMLInputElement>) => {
    const _nes = await rom(nes, e?.target?.files?.[0] as File);
    setNes(_nes);
    setProg(decompileNes(_nes));
  };

  return (
    <main className="flex w-screen h-screen">
      <div className="w-1/3 flex-col flex">
        <div className="w-full h-2/3 bg-blue-500 overflow-y-scroll pl-3">
          <Code currIns={currIns} dec={prog} />
          {currIns}
        </div>
        <div className="w-full h-1/3 bg-red-500"></div>
      </div>
      <div className="w-2/3 bg-purple-500 flex items-center justify-center flex-col">
        <RenderNes nes={nes} canvasRef={canvasRef} mult={mult} />
        <input type="file" name="rom" id="rom" onChange={handleChangeRom} />
        <button onClick={next}>next</button>
      </div>
    </main>
  );
}
