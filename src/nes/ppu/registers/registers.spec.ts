import { writeBusNes } from "@/nes/bus/bus";
import { initNes } from "@/nes/nes";
import { getNameTable } from "./registers";

describe("PPU registers", () => {
  test("0x2000", () => {
    let nes = initNes();

    nes = writeBusNes(0x2000, 0, nes);
    expect(getNameTable(nes)).toBe(0x2000);

    nes = writeBusNes(0x2000, 1, nes);
    expect(getNameTable(nes)).toBe(0x2400);

    nes = writeBusNes(0x2000, 2, nes);
    expect(getNameTable(nes)).toBe(0x2800);

    nes = writeBusNes(0x2000, 3, nes);
    expect(getNameTable(nes)).toBe(0x2c00);
  });
});
