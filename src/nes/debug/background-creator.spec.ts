import { multiplyMatrix } from "../helper/multiply-matrix";
import { repeat } from "../helper/repeat";
import { Nes, initNes } from "../nes";
import { initMatrix, renderAttributeTable } from "../ppu/render/render";
import { createAttributeTable } from "./background-creator";

describe("background creator", () => {
  let nes: Nes;

  beforeEach(() => {
    nes = initNes();
  });

  test("attribute table", () => {
    let attributeTable = initMatrix(0, 16, 15);

    attributeTable[14] = repeat(16).map((_) => 1);

    nes = createAttributeTable(0x23c0, attributeTable, nes);

    const [att, _nes] = renderAttributeTable(nes, 0);

    expect(att.length).toBe(30);
    expect(att[0].length).toBe(32);

    attributeTable = multiplyMatrix(attributeTable, 2);

    expect(attributeTable.length).toBe(30);
    expect(attributeTable[0].length).toBe(32);

    expect(att).toStrictEqual(attributeTable);
  });
});
