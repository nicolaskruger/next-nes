import { writeBusNes } from "@/nes/bus/bus";
import { initNes } from "@/nes/nes";
import {
  getAmountIncrement,
  getNameTable,
  getPatterTableBackground,
  getPatternTableSprite,
  getSizeOfSprite,
} from "./registers";

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
  test("0x2000 bit 2 amount", () => {
    let nes = initNes();

    nes = writeBusNes(0x2000, 0, nes);
    expect(getAmountIncrement(nes)).toBe(1);

    nes = writeBusNes(0x2000, 1 << 2, nes);

    expect(getAmountIncrement(nes)).toBe(32);
  });

  test("0x2000 bit 3 pattern table sprite", () => {
    let nes = initNes();

    nes = writeBusNes(0x2000, 0, nes);

    expect(getPatternTableSprite(nes)).toBe(0);

    nes = writeBusNes(0x2000, 1 << 3, nes);

    expect(getPatternTableSprite(nes)).toBe(0x1000);
  });

  test("0x2000 bit 4 pattern table background", () => {
    let nes = initNes();

    nes = writeBusNes(0x200, 0, nes);

    expect(getPatterTableBackground(nes)).toBe(0);

    nes = writeBusNes(0x2000, 1 << 4, nes);

    expect(getPatterTableBackground(nes)).toBe(0x1000);
  });

  test("0x2000 bit 5", () => {
    let nes = initNes();

    nes = writeBusNes(0x2000, 0, nes);

    expect(getSizeOfSprite(nes)).toBe("8x8");

    nes = writeBusNes(0x2000, 1 << 5, nes);

    expect(getSizeOfSprite(nes)).toBe("8x16");
  });
});
