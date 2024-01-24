import { RefObject, useEffect, useRef } from "react";

type CanvasRef = RefObject<HTMLCanvasElement>;

const getCanvas = (ref: CanvasRef) => ref.current as HTMLCanvasElement;

const getCanvasContext = (ref: CanvasRef) => getCanvas(ref)?.getContext("2d");

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {}, []);

  return <canvas ref={canvasRef} width={256} height={240} />;
}
