import fs from "fs";
import { initNes } from "../nes";
import { KB16, KB8, rom } from "./rom";
import { readBusNes } from "../bus/bus";
import { tick } from "../tick";
import { getACC } from "../cpu/cpu";
import { getAddrVRam } from "../ppu/registers/registers";
import { compileNes } from "../cpu/runner/runner";
import { compile } from "../cpu/compiler/compiler";
import { repeat } from "../helper/repeat";
import { readRangeVRam, readVRam } from "../ppu/vram/vram";
import {
  initDemoRom,
  tickUntil,
  tickUntilEndDemoRom,
  tickUntilTimes,
} from "../debug/rom-debug";

describe("ROM", () => {
  test("nestest", async () => {
    const romFile = fs.readFileSync("./roms/nestest.nes");
    let nes = initNes();
    expect(
      async () =>
        await rom(nes, {
          arrayBuffer: async () => romFile,
          name: "nestest.nes",
        } as unknown as File)
    ).not.toThrow();
  });

  test("demo.nes", async () => {
    const romFile = fs.readFileSync("./games/demo/demo.nes", "binary");
    let nes = initNes();
    nes = await rom(nes, {
      arrayBuffer: async () => Buffer.from(romFile),
      name: "nestest.nes",
    } as unknown as File);

    expect(nes.bus[0x8000].data).toBe(0x78);
    expect(readBusNes(0x2002, nes)[0]).toBe(128);
  });
  test("constants", async () => {
    console.log(KB16, KB8);
  });

  test("demo.nes write pallet", async () => {
    let nes = await initDemoRom();
    nes = tickUntilEndDemoRom(nes);
    expect(readRangeVRam(0x3f00, 0x20, nes)[0]).toStrictEqual([
      0x0f, 0x00, 0x00, 0x00, 0x0f, 0x00, 0x00, 0x00, 0x0f, 0x00, 0x00, 0x00,
      0x0f, 0x00, 0x00, 0x00, 0x0f, 0x20, 0x00, 0x00, 0x0f, 0x00, 0x00, 0x00,
      0x0f, 0x00, 0x00, 0x00, 0x0f, 0x00, 0x00, 0x00,
    ]);
  });

  test("demo.nes enable rendering", async () => {
    let nes = await initDemoRom();
    nes = tickUntilEndDemoRom(nes);
    expect(readBusNes(0x2000, nes)[0]).toBe(0x80);
    expect(readBusNes(0x2001, nes)[0]).toBe(0x10);
  });

  test("demo.nes debug", async () => {
    const romFile = fs.readFileSync("./games/demo/demo.nes");
    let nes = initNes();
    nes = await rom(nes, {
      arrayBuffer: async () => romFile,
      name: "demo.nes",
    } as unknown as File);

    nes = tickUntil(0x8049, nes);

    expect(getAddrVRam(nes)).toBe(0x3f00);

    [
      0x0f, 0x00, 0x00, 0x00, 0x0f, 0x00, 0x00, 0x00, 0x0f, 0x00, 0x00, 0x00,
      0x0f, 0x00, 0x00, 0x00, 0x0f, 0x20, 0x00, 0x00, 0x0f, 0x00, 0x00, 0x00,
      0x0f, 0x00, 0x00, 0x00, 0x0f, 0x00, 0x00, 0x00,
    ].forEach((v, i) => {
      nes = tickUntilTimes(0x8052, 1, nes);
      expect(getAddrVRam(nes)).toBe(0x3f01 + i);
      expect(getACC(nes)).toBe(v);
      expect(readVRam(0x3f00 + i, nes)[0]).toBe(v);
    });

    try {
      while (nes.cpu.PC !== 0x805e) {
        nes = tick(nes).nes;
      }
    } catch (e) {
      console.log(nes);
    }
    expect(readRangeVRam(0x3f00, 0x20, nes)[0]).toStrictEqual([
      0x0f, 0x00, 0x00, 0x00, 0x0f, 0x00, 0x00, 0x00, 0x0f, 0x00, 0x00, 0x00,
      0x0f, 0x00, 0x00, 0x00, 0x0f, 0x20, 0x00, 0x00, 0x0f, 0x00, 0x00, 0x00,
      0x0f, 0x00, 0x00, 0x00, 0x0f, 0x00, 0x00, 0x00,
    ]);
    console.log(nes);
  });

  test("write 2007 register", () => {
    let nes = initNes();

    const program = `
      lda #63
      sta $2006
      lda #0
      sta $2006
      lda #15
      sta $2007
      sta $2007
      sta $2007
      sta $2007
      sta $2007
      sta $2007
    `;

    nes = compileNes(compile(program), nes);

    nes = tick(nes).nes; // lda #53
    expect(getACC(nes)).toBe(63);
    nes = tick(nes).nes; // sta $2006
    nes = tick(nes).nes; // lda #0
    expect(getACC(nes)).toBe(0);
    nes = tick(nes).nes; // sta $2006
    expect(getAddrVRam(nes)).toBe(0x3f00);
    nes = tick(nes).nes; // lda #15
    expect(getACC(nes)).toBe(0x0f);

    repeat(6).forEach((_, i) => {
      nes = tick(nes).nes; // sta $2007
      expect(getAddrVRam(nes)).toBe(0x3f01 + i);
      expect(readVRam(0x3f00 + i, nes)[0]).toBe(0xf);
    });
  });
});
