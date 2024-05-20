import { useEffect, useState } from "react";
import { useSize } from "../size/size";
import { HEIGHT, WIDTH } from "@/constants/size";

type Mult = {
  W: number;
  H: number;
};

export const useMult = (size?: Mult) => {
  let W = 1;
  let H = 1;
  if (size) {
    (W = size.W), (H = size.H);
  }
  const dimension = useSize();
  const [mult, setMult] = useState(0);
  useEffect(() => {
    const { height, width } = dimension;
    const sw = Math.floor((W * width) / WIDTH);
    const sh = Math.floor((H * height) / HEIGHT);
    setMult(Math.min(sw, sh));
  }, [dimension]);

  return mult;
};
