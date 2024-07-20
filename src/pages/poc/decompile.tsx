import { Code } from "@/components/code/code";

import { RenderTiles } from "@/components/render-tiles/render-tiles-img";
import { PrerenderBuilder } from "@/components/prerender-builder/prerender-builder";
import { usePrerender } from "@/hooks/prerender/usePrerender";
import { getPC } from "@/nes/cpu/cpu";

import { createMushroomWord } from "@/nes/debug/background-creator";
import { Nes } from "@/nes/nes";
import { setRefreshPallet } from "@/nes/ppu/refresh/refresh";
import { render } from "@/nes/render/render-img-tile";
import { rom } from "@/nes/rom/rom";
import { tick } from "@/nes/tick";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type NesRefresh = Nes & { refresh?: boolean };

const startNes = () => createMushroomWord();

export default function Decompile() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [interval, setIntervalCode] = useState<NodeJS.Timeout>();

  const [nes, setNes] = useState<Nes & { refresh?: boolean }>({
    ...startNes(),
    refresh: true,
  });
  const [fileName, setFileName] = useState("");
  const { refreshPallet, ...props } = usePrerender(nes, 2);
  const { getTile, loading, percent, refresh, canvas } = props;
  useEffect(() => {
    setNes((nes) => {
      const _nes = render(nes, getTile, 2, canvasRef); //30 ms
      return setRefreshPallet(_nes, refreshPallet);
    });
  }, []);

  const setNesDecompile = (nes: NesRefresh) => {
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
    const file = e?.target?.files?.[0];
    if (file) {
      try {
        const _nes = await rom(nes, file);
        setFileName(file.name as string);
        setNesDecompile({ ..._nes, refresh: true });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const play = () => {
    if (interval) {
      clearInterval(interval);
      setIntervalCode(undefined);
      return;
    }
    const intervalCode = setInterval(() => {
      let { nes: _nes, executeTime } = tick(nes);
      while (executeTime < 1000 / 50) {
        const _tick = tick(_nes);
        _nes = _tick.nes;
        executeTime += _tick.executeTime;
      }
      setNesDecompile(_nes);
    }, 1);
    setNes((nes) => ({ ...nes, refresh: true }));
    setIntervalCode(intervalCode);
  };

  useEffect(() => {
    if (canvas && nes.refresh) {
      refresh();
      delete nes.refresh;
      setNes(nes);
    }
  }, [nes.refresh]);

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
          <button onClick={play}>{interval ? "stop" : "play"}</button>
          {loading && (
            <p className="text-red-800">loading: {percent.toFixed(2)}%</p>
          )}
        </div>
      </main>
    </>
  );
}
