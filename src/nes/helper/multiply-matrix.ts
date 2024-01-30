import { pa } from "./pa";
import { repeat } from "./repeat";

type MatrixPoint<T> = {
  x: number;
  y: number;
  value: T;
};

type CombinationReturn = {
  x: number;
  y: number;
};

const combinationTwoArr = (a: number[], b: number[]): CombinationReturn[] => {
  let result: CombinationReturn[] = [];
  a.forEach((a) => {
    b.forEach((b) => {
      result = [
        ...result,
        {
          x: a,
          y: b,
        },
      ];
    });
  });
  return result;
};

export const multiplyMatrix = <T>(matrix: T[][], value: number): T[][] => {
  const initMatrix = () =>
    repeat(matrix.length * value).map((_) =>
      repeat(matrix[0].length * value).map((_) => 0 as T)
    );
  let result = initMatrix();

  const paOfIndex = (index: number) => pa(index * value, 1, value);

  return matrix.reduce<T[][]>((result, line, y) => {
    line
      .reduce<MatrixPoint<T>[]>((matrixPointArr, value, x) => {
        const combine = combinationTwoArr(paOfIndex(x), paOfIndex(y)).map(
          ({ x, y }) => ({ x, y, value })
        );

        return [...matrixPointArr, ...combine];
      }, [])
      .forEach(({ x, y, value }) => {
        result[y][x] = value;
      });

    return result;
  }, result);
};
