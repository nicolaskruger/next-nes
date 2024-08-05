import fs from "fs";
import { initNes } from "../nes";
import { KB16, KB8, rom } from "./rom";
import { readBusNes } from "../bus/bus";
import { tick } from "../tick";
import { getACC } from "../cpu/cpu";
import {
  getAddrVRam,
  isShowSpr,
  isSprLeftMost8Pix,
} from "../ppu/registers/registers";
import { compileNes } from "../cpu/runner/runner";
import { compile } from "../cpu/compiler/compiler";
import { repeat } from "../helper/repeat";
import { readRangeVRam, readVRam } from "../ppu/vram/vram";
import {
  initDemoRom,
  initNesTestRom,
  initUnisinosRom,
  nesTestCode,
  tickConditional,
  tickFor,
  tickUntil,
  tickUntilEndDemoRom,
  tickUntilTimes,
} from "../debug/rom-debug";
import { NMI } from "../cpu/instruction/instruction";
import { readRangeSprRam, readSprInfo } from "../ppu/spr-ram/spr-ram";
import { decompileNes } from "../cpu/decompiler/decompile";
import { dexToHex } from "../helper/converter";

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

  test("demo.nes write sprites", async () => {
    let nes = await initDemoRom();
    nes = tickUntilEndDemoRom(nes);
    nes = NMI(nes);
    nes = tickUntilEndDemoRom(nes);
    const [data] = readRangeSprRam(0, 4 * 7, nes);
    expect(data).toStrictEqual([
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x6c, 0x00, 0x00, 0x6c,
      0x6c, 0x01, 0x00, 0x76, 0x6c, 0x02, 0x00, 0x80, 0x6c, 0x02, 0x00, 0x8a,
      0x6c, 0x03, 0x00, 0x94,
    ]);
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

  test("test nestest.txt code", async () => {
    const [code8000, code8003] = nesTestCode();

    expect(code8000).toStrictEqual({ addr: 0x8000, instruction: "JMP" });
    expect(code8003).toStrictEqual({ addr: 0x8003, instruction: "RTS" });
  });

  test("test nestest.nes code", async () => {
    const code = nesTestCode();
    const nes = await initNesTestRom();
    const romCode = decompileNes(nes);
    fs.writeFileSync("./roms/nestest.out.txt", romCode.program);
    code.forEach(({ addr, instruction }, index) => {
      let [inst] = romCode.instruction[index].inst.split(/\s/);
      if (inst === "XXX") inst = "UND";
      expect({
        inst: instruction,
        addr: dexToHex(addr, 4, true),
      }).toStrictEqual({
        inst,
        addr: dexToHex(0x8000 + romCode.instruction[index].index, 4, true),
      });
    });
  });

  test("test nestest.nes until error", async () => {
    let nes = await initNesTestRom();
    try {
      while (true) {
        nes = tick(nes).nes;
      }
    } catch (error) {
      nes;
      console.log(error);
    }
  });

  test("test nestest.nes tick until", async () => {
    let nes = await initNesTestRom();
    nes = tickUntil(0xceed, nes);
    nes = tick(nes).nes;
    nes;
  });

  test.skip("test unisinos should render sprite", async () => {
    let nes = await initUnisinosRom();
    nes = tickFor(1000, nes);

    const [{ y, x, tile, pallet }] = readSprInfo(10, nes);

    expect(y).toBe(0xd0);
    expect(x).toBe(0x10);
    expect(tile).toBe(0x05);
    expect(pallet).toBe(0x1);
    expect(isShowSpr(nes)[0]).toBe(true);
  });

  test("test unisinos toggle state", async () => {
    let nes = await initUnisinosRom();
    nes = tickConditional((nes) => nes.bus[0].data === 1, nes);
    nes = tickConditional((nes) => nes.bus[0].data === 0, nes);
  });

  test("test unisinos write tile", async () => {
    let nes = await initUnisinosRom();
    nes = tickFor(1000, nes);
    nes.ppu.vram.bus
      .slice(0x2000, 0x23c0)
      .map(({ data }) => data)
      .forEach((v, i) => {
        if (i / 32 <= 28) {
          expect(v).toBe(8);
        } else {
          expect(v).toBe(7);
        }
      });
  });
  test("test unisinos change bit", async () => {
    let nes = await initUnisinosRom();
    nes = tickConditional((nes) => nes.ppu.vram.addr !== 0x2000, nes);
    expect(nes.ppu.vram.addr).toBe(0x2000);
    nes = tickConditional((nes) => nes.cpu.Y !== 28, nes);
    expect(nes.cpu.ACC).toBe(8);
    expect(nes.cpu.Y).toBe(28);
    nes = tick(nes).nes; // cpy
    nes = tick(nes).nes; // beq
    nes = tick(nes).nes; // lda
    expect(nes.cpu.ACC).toBe(7);

    nes = tickConditional((nes) => nes.cpu.Y !== 29, nes);

    console.log(nes.ppu.vram.addr.toString(16));
    console.log(
      nes.ppu.vram.bus.slice(0x2000 + 32 * 29, 0x23c0).map(({ data }) => data)
    );
    expect(nes.cpu.Y).toBe(29);
    nes = tick(nes).nes; // cpy
    nes = tick(nes).nes; // beq
    nes = tick(nes).nes; // jmp
    expect(nes.cpu.ACC).toBe(7);
  });

  test("test addr unisinos", () => {
    async () => {
      let nes = await initUnisinosRom();
      repeat(0x3c0).forEach((_, i) => {
        nes = tickConditional((nes) => nes.ppu.vram.addr !== 0x2000 + i, nes);
      });

      console.log(nes.cpu.X);
    };
  });
});
