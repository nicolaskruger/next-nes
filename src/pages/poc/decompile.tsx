import { Code } from "@/components/code/code";
import { Pallets } from "@/components/pallets/pallets";
import { RenderNes } from "@/components/render-nes/reder-nes";
import { RenderTiles } from "@/components/render-tiles/render-tiles";
import { useMult } from "@/hooks/mult/mult";
import { getPC } from "@/nes/cpu/cpu";
import {
  Decompile as Dec,
  decompileNes,
  findCurrentInstruction,
} from "@/nes/cpu/decompiler/decompile";
import { NMI } from "@/nes/cpu/instruction/instruction";
import { createMushroomWord } from "@/nes/debug/background-creator";
import { dexToHex } from "@/nes/helper/converter";
import { Nes, initNes } from "@/nes/nes";
import { rom } from "@/nes/rom/rom";
import { tick } from "@/nes/tick";
import { ChangeEvent, useEffect, useRef, useState } from "react";

const startNes = () => createMushroomWord();

export default function Decompile() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mult = useMult({ H: 1, W: 2 / 3 });
  const [nes, setNes] = useState(startNes());
  const [prog, setProg] = useState<Dec>({ instruction: [], program: "" });
  const [currIns, setCurr] = useState(0);
  const [numInst, setNumInst] = useState(1);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    setProg(decompileNes(startNes()));
  }, []);

  const next = () => {
    let _nes = {
      ...nes,
    };
    _nes = tick(nes).nes;
    setNes({ ..._nes, d: Math.random() } as unknown as Nes);
    setCurr(findCurrentInstruction(_nes, prog));
  };
  const finish = () => {
    let _nes = {
      ...nes,
    };

    const end = () => {
      while (getPC(_nes) !== 0x805e) {
        _nes = tick(_nes).nes;
      }
    };

    if (fileName === "demo.nes") {
      end();
      // _nes = NMI(_nes);
      end();
    }

    console.log(_nes);
    setNes(_nes);
    setCurr(findCurrentInstruction(_nes, prog));
  };

  const handleChangeRom = async (e: ChangeEvent<HTMLInputElement>) => {
    const _nes = await rom(nes, e?.target?.files?.[0] as File);
    setFileName(e?.target?.files?.[0].name as string);
    setNes(_nes);
    setProg(decompileNes(_nes));
  };

  const play = () => {
    setInterval(() => {
      let { nes: _nes, executeTime } = tick(nes);
      while (executeTime < 1000 / 50) {
        const _tick = tick(_nes);
        _nes = _tick.nes;
        executeTime += _tick.executeTime;
      }
      setNes({ ..._nes, d: Math.random() } as unknown as Nes);
      setCurr(findCurrentInstruction(_nes, prog));
    }, 1);
  };

  return (
    <main className="flex w-screen h-screen">
      <div className="w-1/3 flex-col flex">
        <div className="w-full h-2/3 bg-blue-500 overflow-y-scroll pl-3">
          <Code currIns={currIns} dec={prog} />
          {currIns}
        </div>
        <div className="w-full h-1/3 flex justify-center items-center bg-red-500 overflow-y-scroll">
          {/* <Pallets nes={nes} /> */}
          <RenderTiles nes={nes} />
        </div>
      </div>
      <div className="w-2/3 bg-purple-500 flex items-center justify-center flex-col">
        <RenderNes nes={nes} canvasRef={canvasRef} mult={mult} />
        <input type="file" name="rom" id="rom" onChange={handleChangeRom} />
        <button onClick={next}>next</button>
        <button onClick={finish}>finish</button>
        <button onClick={play}>play</button>
        <input
          type="number"
          value={numInst}
          onChange={(e) => setNumInst(Number(e.target.value))}
        />
      </div>
    </main>
  );
}
