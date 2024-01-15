import { writeBusNes } from "@/nes/bus/bus";
import { initNes } from "@/nes/nes";
import { getAmountIncrement, getNameTable } from "./registers";

describe("PPU registers", () => {
  test("0x2000 bit 0-1 name table", () => {
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
  test("0x2001 bit 2 amount", () => {
    let nes = initNes();

    nes = writeBusNes(0x2000, 0, nes);
    expect(getAmountIncrement(nes)).toBe(1);

    nes = writeBusNes(0x2000, 1 << 2, nes);

    expect(getAmountIncrement(nes)).toBe(32);
  });
});
