import { Nes, initNes } from "@/nes/nes";
import { renderAttributeTable, renderNameTable } from "./render";
import { writeVRam } from "../vram/vram";
import { getNameTable } from "../registers/registers";

const binaryToInt = (binary: string) => parseInt(binary, 2);

describe("render", () => {
  let nes: Nes;

  beforeEach(() => {
    nes = initNes();
  });
  test("name table", () => {
    const [nameTable] = renderNameTable(nes);

    expect(nameTable.length).toBe(30);
    nameTable.forEach((table) => {
      expect(table.length).toBe(32);
      table.forEach((t) => expect(t).toBe(0));
    });
  });

  test("attribute table", () => {
    nes = writeVRam(0x23c0, binaryToInt("11100100"), nes);
    nes = writeVRam(0x23f8, binaryToInt("11100100"), nes);
    const [attributeTable] = renderAttributeTable(nes);

    expect(attributeTable[0][0]).toBe(0);
    expect(attributeTable[0][1]).toBe(0);
    expect(attributeTable[1][0]).toBe(0);
    expect(attributeTable[1][1]).toBe(0);

    expect(attributeTable[0][2]).toBe(1);
    expect(attributeTable[0][3]).toBe(1);
    expect(attributeTable[1][2]).toBe(1);
    expect(attributeTable[1][3]).toBe(1);

    expect(attributeTable[2][0]).toBe(2);
    expect(attributeTable[2][1]).toBe(2);
    expect(attributeTable[3][0]).toBe(2);
    expect(attributeTable[3][1]).toBe(2);

    expect(attributeTable[2][2]).toBe(3);
    expect(attributeTable[2][3]).toBe(3);
    expect(attributeTable[3][2]).toBe(3);
    expect(attributeTable[3][3]).toBe(3);

    expect(attributeTable[28][0]).toBe(0);
    expect(attributeTable[28][1]).toBe(0);
    expect(attributeTable[29][0]).toBe(0);
    expect(attributeTable[29][1]).toBe(0);

    expect(attributeTable[28][2]).toBe(1);
    expect(attributeTable[28][3]).toBe(1);
    expect(attributeTable[29][2]).toBe(1);
    expect(attributeTable[29][3]).toBe(1);

    expect(attributeTable.length).toBe(30);
    attributeTable.forEach((table) => {
      expect(table.length).toBe(32);
    });
  });
});
