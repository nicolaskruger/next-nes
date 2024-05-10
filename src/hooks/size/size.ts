import { HEIGHT, WIDTH } from "@/constants/size";
import { useEffect, useState } from "react";

const useSize = () => {
  const [dimensions, setDimensions] = useState({
    width: WIDTH,
    height: HEIGHT,
  });
  const handleResize = () => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };
  useEffect(() => {
    window.addEventListener("resize", handleResize, false);
  }, []);
  return dimensions;
};

export { useSize };
