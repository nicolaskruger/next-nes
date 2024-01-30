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
    nes = writeVRam(0x23c0, binaryToInt("00011011"), nes);
    const [attributeTable] = renderAttributeTable(nes);

    expect(attributeTable[0][0]).toBe(0);
    expect(attributeTable[0][1]).toBe(0);
    expect(attributeTable[1][0]).toBe(0);
    expect(attributeTable[1][1]).toBe(0);

    expect(attributeTable[2][2]).toBe(1);
    expect(attributeTable[2][3]).toBe(1);
    expect(attributeTable[3][2]).toBe(1);
    expect(attributeTable[3][3]).toBe(1);

    expect(attributeTable[4][0]).toBe(2);
    expect(attributeTable[4][1]).toBe(2);
    expect(attributeTable[5][0]).toBe(2);
    expect(attributeTable[5][1]).toBe(2);

    expect(attributeTable[4][2]).toBe(2);
    expect(attributeTable[4][3]).toBe(2);
    expect(attributeTable[5][2]).toBe(2);
    expect(attributeTable[5][3]).toBe(2);

    expect(attributeTable.length).toBe(30);
    attributeTable.forEach((table) => {
      expect(table.length).toBe(32);
      table.forEach((t) => expect(t).toBe(0));
    });
  });
});
