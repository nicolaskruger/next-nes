import { PrerenderBuilder } from "@/components/prerender-builder/prerender-builder";
import { usePrerender } from "@/hooks/prerender/usePrerender";
import { createMushroomWord } from "@/nes/debug/background-creator";
import { multiplyMatrix } from "@/nes/helper/multiply-matrix";
import { Nes } from "@/nes/nes";
import { renderScreen } from "@/nes/ppu/render/render";
// import { render } from "@/nes/render/render";
import { render } from "@/nes/render/render-img-tile";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nes, setNes] = useState<Nes>(createMushroomWord());
  const props = usePrerender(nes, 2);
  const { getTile } = props;
  useEffect(() => {
    setNes((nes) => {
      const start = performance.now();
      const _nes = render(nes, getTile, 2, canvasRef); //30 ms
      //   const _nes = nes;
      //   render(multiplyMatrix(renderScreen(nes)[0], 2), canvasRef); 2000ms
      const finish = performance.now();
      return _nes;
    });
  }, []);

  return (
    <>
      <PrerenderBuilder {...props} />
      <canvas ref={canvasRef} width={256 * 2} height={240 * 2} />
    </>
  );
}
