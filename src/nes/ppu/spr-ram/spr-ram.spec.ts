import { initNes } from "@/nes/nes";
import { readSprRam } from "./spr-ram";

describe("spr-ram", () => {
  test("should not access memory less than 0x00 nether mote 0xff", () => {
    let nes = initNes();

    expect(() => readSprRam(-1, nes)).toThrow("PPU SPR-RAM out of range");
    expect(() => readSprRam(0x100, nes)).toThrow("PPU SPR-RAM out of range");
  });

  test("should read memory", () => {
    let nes = initNes();

    nes.ppu.sprRam[0].data = 4;

    expect(readSprRam(0, nes)).toBe(4);
  });
});
