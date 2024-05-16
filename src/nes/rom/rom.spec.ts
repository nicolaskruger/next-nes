import fs from "fs";
import { initNes } from "../nes";
import { rom } from "./rom";
describe("ROM", () => {
  test("nestest", async () => {
    const romFile = fs.readFileSync("./roms/nestest.nes").toString();
    let nes = initNes();
    expect(
      async () =>
        await rom(nes, {
          text: async () => romFile,
          name: "nestest.nes",
        } as File)
    ).not.toThrow();
  });
});
