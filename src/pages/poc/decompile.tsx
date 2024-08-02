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
import { NMI } from "@/nes/cpu/instruction/instruction";
import { getNMIInfo } from "@/nes/cpu/interrupt/interrupt";
import { useControl } from "@/hooks/control/control";
import { updatePad1 } from "@/nes/control/control";

type NesRefresh = Nes & { refresh?: boolean };

const startNes = () => createMushroomWord();

export default function Decompile() {
  const { control, ...controlProps } = useControl();

  const main = useRef<HTMLDivElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fps = useRef(0);

  const timeOutCode = useRef<NodeJS.Timeout>();

  const nes = useRef<Nes & { refresh?: boolean }>({
    ...startNes(),
    refresh: true,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      console.log({ fps: fps.current });
      fps.current = 0;
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const [fileName, setFileName] = useState("");
  const { refreshPallet, ...props } = usePrerender(nes.current, 2);
  const { getTile, loading, percent, refresh, canvas } = props;
  useEffect(() => {
    const _nes = render(nes.current, getTile, 2, canvasRef); //30 ms
    nes.current = setRefreshPallet(_nes, refreshPallet);
  }, []);

  const setNesDecompile = (_nes: NesRefresh) => {
    nes.current = render(_nes, getTile, 2, canvasRef);
  };

  const next = () => {
    setNesDecompile(tick(nes.current).nes);
  };
  const finish = () => {
    let _nes = {
      ...nes.current,
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
        const _nes = await rom(nes.current, file);
        setFileName(file.name as string);
        setNesDecompile({ ..._nes, refresh: true });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const play = () => {
    const timeOut = () => {
      const timeBox = 1000 / 60;
      let { nes: _nes, executeTime } = tick(nes.current);
      _nes = updatePad1({ right: true }, _nes);
      _nes = NMI(_nes);
      const clock = () => {
        const _tick = tick(_nes);
        _nes = _tick.nes;
        executeTime += _tick.executeTime;
      };
      if (getNMIInfo(_nes).occur) while (getNMIInfo(_nes).occur) clock();
      else while (executeTime < 1000 / 60) clock();
      const renderStart = performance.now();
      setNesDecompile(_nes);
      executeTime += performance.now() - renderStart;
      timeOutCode.current = setTimeout(timeOut, timeBox - executeTime);
      fps.current++;
    };
    if (timeOutCode) {
      clearTimeout(timeOutCode.current);
      timeOutCode.current = undefined;
    }

    timeOutCode.current = setTimeout(timeOut, 0);

    nes.current = { ...nes.current, refresh: true };
  };

  useEffect(() => {
    if (canvas && nes.current.refresh) {
      refresh();
      delete nes.current.refresh;
    }
  }, [nes.current]);

  return (
    <>
      <PrerenderBuilder {...props} />
      <main ref={main} className="flex w-screen h-screen" {...controlProps}>
        <div className="w-1/3 flex-col flex">
          <div className="w-full h-2/3 bg-blue-500 overflow-y-scroll pl-3">
            {/* <Code nes={nes} /> */}
          </div>
          <div className="w-full h-1/3 flex justify-center items-center bg-red-500 overflow-y-scroll">
            {/* <RenderTiles imgs={props.imgs} index={5} /> */}
            {/* <Pallets nes={nes} /> */}
          </div>
        </div>
        <div className="w-2/3 bg-purple-500 flex items-center justify-center flex-col">
          <canvas ref={canvasRef} width={256 * 2} height={240 * 2} />
          <input type="file" name="rom" id="rom" onChange={handleChangeRom} />
          <button onClick={next}>next</button>
          <button onClick={finish}>finish</button>
          <button onClick={play}>{timeOutCode ? "stop" : "play"}</button>
          {loading && (
            <p className="text-red-800">loading: {percent.toFixed(2)}%</p>
          )}
          <p>right: {control.right ? "true" : "false"}</p>
        </div>
      </main>
    </>
  );
}
