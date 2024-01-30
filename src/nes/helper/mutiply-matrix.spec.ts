import { multiplyMatrix } from "./multiply-matrix";

describe("multiply matrix", () => {
  test("by two", () => {
    expect(multiplyMatrix([[0]], 2)).toStrictEqual([
      [0, 0],
      [0, 0],
    ]);
  });

  test("by three", () => {
    expect(multiplyMatrix([[0]], 3)).toStrictEqual([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
  });

  test("by order", () => {
    expect(
      multiplyMatrix(
        [
          [0, 1],
          [2, 3],
        ],
        2
      )
    ).toStrictEqual([
      [0, 0, 1, 1],
      [0, 0, 1, 1],
      [2, 2, 3, 3],
      [2, 2, 3, 3],
    ]);
  });
});
