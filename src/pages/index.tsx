import { PrerenderBuilder } from "@/components/prerender-builder/prerender-builder";
import { useControl } from "@/hooks/control/control";
import { usePrerender } from "@/hooks/prerender/usePrerender";
import { updatePad1 } from "@/nes/control/control";
import { NMI } from "@/nes/cpu/instruction/instruction";
import { getNMIInfo } from "@/nes/cpu/interrupt/interrupt";
import { createMushroomWord } from "@/nes/debug/background-creator";
import { load } from "@/nes/load/load";
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

  const timeOutCode = useRef<NodeJS.Timeout>();

  const [start, setStart] = useState(true);

  const nes = useRef<Nes & { refresh?: boolean }>({
    ...startNes(),
    refresh: true,
  });

  const [fileName, setFileName] = useState("");
  const { refreshPallet, ...props } = usePrerender(nes.current, multi);
  const { getTile, refresh, loading, percent, clearTile } = props;
  useEffect(() => {
    const _nes = render(nes.current, getTile, multi, canvasRef, clearTile); //30 ms
    nes.current = setRefreshPallet(_nes, refreshPallet);
  }, []);

  const setNesDecompile = (_nes: NesRefresh) => {
    nes.current = render(_nes, getTile, multi, canvasRef, clearTile);
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
    try {
      nes.current = load(nes.current);
      const timeOut = () => {
        const start = performance.now();
        const timeBox = 1000 / 60;
        let _nes = tick(nes.current);
        _nes = updatePad1(control.current, _nes);
        _nes = NMI(_nes);
        const clock = () => {
          _nes = tick(_nes);
        };
        while (getNMIInfo(_nes).occur) clock();
        setNesDecompile(_nes);
        timeOutCode.current = setTimeout(
          timeOut,
          timeBox - (start - performance.now())
        );
      };
      if (timeOutCode.current) {
        clearTimeout(timeOutCode.current);
        timeOutCode.current = undefined;
      } else {
        timeOutCode.current = setTimeout(timeOut, 0);
        nes.current = { ...nes.current, refresh: true };
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (nes.current.refresh) {
      refresh();
      delete nes.current.refresh;
    }
  }, [nes.current]);
  return (
    <>
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
