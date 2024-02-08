import { Screen, initMatrix } from "../ppu/render/render";

export const cutFromScreen = (
  screen: Screen,
  x: number,
  y: number,
  xSize: number,
  ySize: number
) => {
  const cut = initMatrix("", xSize, ySize);
  for (let yCut = 0; yCut < ySize; yCut++) {
    for (let xCut = 0; xCut < xSize; xCut++) {
      cut[yCut][xCut] = screen[y + yCut][x + xCut];
    }
  }
  return cut;
};

export const cutBackground = (screen: Screen, x: number, y: number) => {
  return cutFromScreen(screen, x, y, 256, 240);
};

export const cutTile = (screen: Screen, xTile: number, yTile: number) => {
  return cutFromScreen(screen, xTile * 8, yTile * 8, 8, 8);
};
