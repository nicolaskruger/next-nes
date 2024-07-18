import { Code } from "@/components/code/code";

import { RenderTiles } from "@/components/render-tiles/render-tiles-img";
import { PrerenderBuilder } from "@/components/tile-builder/tile-builder";
import { usePrerender } from "@/hooks/tile/useTile";
import { getPC } from "@/nes/cpu/cpu";

import { createMushroomWord } from "@/nes/debug/background-creator";
import { Nes } from "@/nes/nes";
import { setRefreshPallet } from "@/nes/ppu/refresh/refresh";
import { render } from "@/nes/render/render-img-tile";
import { rom } from "@/nes/rom/rom";
import { tick } from "@/nes/tick";
import { ChangeEvent, useEffect, useRef, useState } from "react";

const startNes = () => createMushroomWord();

export default function Decompile() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [nes, setNes] = useState(startNes());
  const [numInst, setNumInst] = useState(1);
  const [fileName, setFileName] = useState("");
  const { refreshPallet, ...props } = usePrerender(startNes(), 2);
  const { getTile, loading } = props;
  useEffect(() => {
    setNes((nes) => {
      const _nes = render(nes, getTile, 2, canvasRef); //30 ms
      return setRefreshPallet(_nes, refreshPallet);
    });
  }, []);

  const setNesDecompile = (nes: Nes) => {
    const _nes = render(nes, getTile, 2, canvasRef);
    setNes(_nes);
  };

  const next = () => {
    setNesDecompile(tick(nes).nes);
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

    if (fileName === "demo.nes") end();

    setNesDecompile(_nes);
  };

  const handleChangeRom = async (e: ChangeEvent<HTMLInputElement>) => {
    const _nes = await rom(nes, e?.target?.files?.[0] as File);
    setFileName(e?.target?.files?.[0].name as string);
    setNes(_nes);
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
    }, 1);
  };

  return (
    <>
      <PrerenderBuilder {...props} />
      <main className="flex w-screen h-screen">
        <div className="w-1/3 flex-col flex">
          <div className="w-full h-2/3 bg-blue-500 overflow-y-scroll pl-3">
            <Code nes={nes} />
          </div>
          <div className="w-full h-1/3 flex justify-center items-center bg-red-500 overflow-y-scroll">
            <RenderTiles imgs={props.imgs} />
          </div>
        </div>
        <div className="w-2/3 bg-purple-500 flex items-center justify-center flex-col">
          <canvas ref={canvasRef} width={256 * 2} height={240 * 2} />
          <input type="file" name="rom" id="rom" onChange={handleChangeRom} />
          <button onClick={next}>next</button>
          <button onClick={finish}>finish</button>
          <button onClick={play}>play</button>
          {loading && <p className="text-red-400">loading..</p>}
        </div>
      </main>
    </>
  );
}
