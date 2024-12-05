import { readBusNes } from "@/nes/bus/bus";
import { initNes } from "@/nes/nes";
import { writePadOne, writePadTwo } from "./controller";

let nes = initNes();

describe("controller", () => {
  beforeEach(() => {
    nes = initNes();
  });

  test.skip("write pad one", () => {
    let [data, _nes] = readBusNes(0x4016, nes);
    nes = _nes;
    expect(data).toBe(0);

    nes = writePadOne(nes, {
      a: false,
      b: true,
      select: false,
      start: true,
      up: false,
      down: true,
      left: false,
      right: true,
    });

    let [data0, _nes0] = readBusNes(0x4016, nes);

    expect(data0).toBe((1 << 1) | (1 << 3) | (1 << 5) | (1 << 7));
  });

  test.skip("write pad two", () => {
    let [data, _nes] = readBusNes(0x4017, nes);
    nes = _nes;
    expect(data).toBe(0);

    nes = writePadTwo(nes, {
      a: true,
      b: false,
      select: true,
      start: false,
      up: true,
      down: false,
      left: true,
      right: false,
    });

    let [data0, _nes0] = readBusNes(0x4017, nes);

    expect(data0).toBe((1 << 0) | (1 << 2) | (1 << 4) | (1 << 6));
  });
});
