import { initNes } from "@/nes/nes";
import { readSprRam, writeSprRam } from "./spr-ram";

describe("spr-ram", () => {
  test("should not read memory less than 0x00 nether mote 0xff", () => {
    let nes = initNes();

    expect(() => readSprRam(-1, nes)).toThrow("PPU SPR-RAM out of range");
    expect(() => readSprRam(0x100, nes)).toThrow("PPU SPR-RAM out of range");
  });

  test("should read memory", () => {
    let nes = initNes();

    nes.ppu.sprRam[0].data = 4;

    expect(readSprRam(0, nes)).toBe(4);
  });

  test("should not write memory less than 0x00 nether mote 0xff", () => {
    let nes = initNes();

    expect(() => writeSprRam(-1, 1, nes)).toThrow("PPU SPR-RAM out of range");
    expect(() => writeSprRam(0x100, 1, nes)).toThrow(
      "PPU SPR-RAM out of range"
    );
  });

  test("should write memory", () => {
    let nes = initNes();

    nes = writeSprRam(0x00, 4, nes);

    expect(readSprRam(0, nes)).toBe(4);
  });
});
