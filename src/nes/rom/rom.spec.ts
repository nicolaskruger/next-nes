import fs from "fs";
import { initNes } from "../nes";
import { rom } from "./rom";
describe("ROM", () => {
  test("nestest", async () => {
    const romFile = fs.readFileSync("./roms/nestest.nes");
    let nes = initNes();
    expect(
      async () =>
        await rom(nes, {
          arrayBuffer: async () => new ArrayBuffer(romFile),
          name: "nestest.nes",
        } as File)
    ).not.toThrow();
  });

  test.skip("demo.nes", async () => {
    const romFile = fs.readFileSync("./games/demo/demo.nes", "binary");
    let nes = initNes();
    nes = await rom(nes, {
      arrayBuffer: async () => Buffer.from(romFile),
      name: "nestest.nes",
    } as File);

    expect(nes.bus[0x8000].data).toBe(0x78);
  });
});
