import { HEIGHT, WIDTH } from "@/constants/size";
import { useState } from "react";

export const useCoordinates = () => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const next = () => {
    const nextX = (x + 1) % WIDTH;
    const nextY = nextX === 0 ? (y + 1) % HEIGHT : y;
    setX(nextX);
    setY(nextY);
  };

  return {
    x,
    y,
    next,
  };
};
