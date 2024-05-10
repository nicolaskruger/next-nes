import { compile } from "@/nes/cpu/compiler/compiler";
import { compileNes } from "@/nes/cpu/runner/runner";
import { createMushroomWord } from "@/nes/debug/background-creator";
import { multiplyMatrix } from "@/nes/helper/multiply-matrix";
import { repeat } from "@/nes/helper/repeat";
import { renderScreen } from "@/nes/ppu/render/render";
import { render, renderMultiply } from "@/nes/render/render";
import { tick } from "@/nes/tick";
import { useCallback, useEffect, useRef, useState } from "react";

let nes = createMushroomWord();
nes = compileNes(compile("JMP $8000"), nes);
nes = repeat(1600).reduce((acc) => tick(acc), nes);
export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);

  const clock = useCallback(() => {
    setA(performance.now());
    // nes = tick(nes)
    nes = repeat(1600).reduce((acc) => tick(acc), nes);
    setB(performance.now());
    renderMultiply(renderScreen(nes)[0], canvasRef, 2);
    setC(performance.now());
  }, [canvasRef]);

  useEffect(() => {
    const loop = setInterval(() => {
      clock();
    }, 1000);
    return () => clearInterval(loop);
  }, []);

  return (
    <div>
      {b - a}
      <canvas ref={canvasRef} width={256 * 2} height={240 * 2} />
      {c - b}
    </div>
  );
}
