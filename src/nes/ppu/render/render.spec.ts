import { Nes, initNes } from "@/nes/nes";
import { renderNameTable } from "./render";

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
});
