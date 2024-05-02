import { useEffect, useState } from "react";
import { useSize } from "../size/size";
import { HEIGHT, WIDTH } from "@/constants/size";

export const useMult = () => {
  const dimension = useSize();
  const [mult, setMult] = useState(0);
  useEffect(() => {
    const { height, width } = dimension;
    const sw = Math.floor(width / WIDTH);
    const sh = Math.floor(height / HEIGHT);
    setMult(Math.min(sw, sh));
  }, [dimension]);

  return mult;
};
