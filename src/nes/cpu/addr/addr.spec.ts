import { Nes } from "@/nes/nes";
import { IMP } from "./addr";

const initNes = (): Nes => ({
  bus: {},
  cpu: {},
  ppu: {},
});

describe("test addressing mode", () => {
  test("Implicit test", () => {
    const nes: Nes = initNes();

    const { cross, data } = IMP(nes);

    expect(cross).toBeFalsy();
    expect(data).toBe(0);
  });
});
