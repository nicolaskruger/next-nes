import { Nes } from "@/nes/nes";
import { PERIOD_MILI, tick } from "@/nes/tick";
import { useEffect, useState } from "react";
import { useControl } from "../control/control";
import { writePadOne } from "@/nes/cpu/ controller/controller";

export const useGameLoop = (_nes: Nes) => {
  const [nes, setNes] = useState(_nes);
  const { control, ...props } = useControl();
  const [clock, setClock] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      let nes0 = writePadOne(nes, control);
      setNes(tick(nes0));
    }, 0);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return { nes, setNes, controlProps: { ...props } };
};
