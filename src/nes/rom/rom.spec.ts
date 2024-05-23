import fs from "fs";
import { initNes } from "../nes";
import { KB16, KB8, rom } from "./rom";
import { readBusNes } from "../bus/bus";
describe("ROM", () => {
  test("nestest", async () => {
    const romFile = fs.readFileSync("./roms/nestest.nes");
    let nes = initNes();
    expect(
      async () =>
        await rom(nes, {
          arrayBuffer: async () => romFile,
          name: "nestest.nes",
        } as File)
    ).not.toThrow();
  });

  test("demo.nes", async () => {
    const romFile = fs.readFileSync("./games/demo/demo.nes", "binary");
    let nes = initNes();
    nes = await rom(nes, {
      arrayBuffer: async () => Buffer.from(romFile),
      name: "nestest.nes",
    } as File);

    expect(nes.bus[0x8000].data).toBe(0x78);
    expect(readBusNes(0x2002, nes)[0]).toBe(128);
  });
  test("constants", async () => {
    console.log(KB16, KB8);
  });
});
