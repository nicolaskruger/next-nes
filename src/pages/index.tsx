import { PrerenderBuilder } from "@/components/prerender-builder/prerender-builder";
import { useControl } from "@/hooks/control/control";
import { usePrerender } from "@/hooks/prerender/usePrerender";
import { updatePad1 } from "@/nes/control/control";
import { NMI } from "@/nes/cpu/instruction/instruction";
import { getNMIInfo } from "@/nes/cpu/interrupt/interrupt";
import { createMushroomWord } from "@/nes/debug/background-creator";
import { Nes } from "@/nes/nes";
import { setRefreshPallet } from "@/nes/ppu/refresh/refresh";
import { render } from "@/nes/render/render-img-tile";
import { rom } from "@/nes/rom/rom";
import { tick } from "@/nes/tick";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type NesRefresh = Nes & { refresh?: boolean };

const startNes = () => createMushroomWord();

const multi = 5;

export default function Decompile() {
  const { control, ...controlProps } = useControl();

  const main = useRef<HTMLDivElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fps = useRef(0);

  const timeOutCode = useRef<NodeJS.Timeout>();

  const [start, setStart] = useState(true);

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
  const { refreshPallet, ...props } = usePrerender(nes.current, multi);
  const { getTile, loading, percent, refresh, canvas, clearTile } = props;
  useEffect(() => {
    const _nes = render(
      nes.current,
      getTile,
      multi,
      canvasRef,
      canvas,
      clearTile
    ); //30 ms
    nes.current = setRefreshPallet(_nes, refreshPallet);
  }, []);

  const setNesDecompile = (_nes: NesRefresh) => {
    nes.current = render(_nes, getTile, multi, canvasRef, canvas, clearTile);
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
    setStart((v) => !v);
    const timeOut = () => {
      const timeBox = 1000 / 60;
      let { nes: _nes, executeTime } = tick(nes.current);
      _nes = updatePad1(control.current, _nes);
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
    if (timeOutCode.current) {
      clearTimeout(timeOutCode.current);
      timeOutCode.current = undefined;
    } else {
      timeOutCode.current = setTimeout(timeOut, 0);
      nes.current = { ...nes.current, refresh: true };
    }
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
      <main
        ref={main}
        className="flex items-center justify-center flex-col w-screen h-screen"
        {...controlProps}
      >
        <canvas
          className="h-5/6"
          ref={canvasRef}
          width={256 * multi}
          height={240 * multi}
        />
        <input
          className="mt-5"
          type="file"
          name="rom"
          id="rom"
          onChange={handleChangeRom}
        />
        <button onClick={play}>{start ? "play" : "stop"}</button>
        {loading && (
          <p className="text-red-800">loading: {percent.toFixed(2)}%</p>
        )}
      </main>
    </>
  );
}
