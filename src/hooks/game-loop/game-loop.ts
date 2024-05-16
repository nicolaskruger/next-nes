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
      if (clock === 0) {
        let nes0 = writePadOne(nes, control);
        const { nes: nes1, cycles } = tick(nes0);
        setNes(nes1);
        setClock(cycles);
      }
      setClock((c) => --c);
    }, PERIOD_MILI);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return { nes, setNes, controlProps: { ...props } };
};
