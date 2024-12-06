import { initUnisinosRom } from "../debug/rom-debug";
import { setVBlank } from "../ppu/registers/registers";
import { load } from "./load";

describe("load", () => {
  it("loading correctly", async () => {
    let nes = await initUnisinosRom();
    nes = setVBlank(nes, true);
    load(nes);
  });
});
