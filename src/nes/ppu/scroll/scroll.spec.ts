import { Nes, initNes } from "@/nes/nes";
import {
  getScrollStatus,
  getScrollX,
  getScrollY,
  write2005scroll,
} from "./scroll";
import { readBusNes, writeBusNes } from "@/nes/bus/bus";

const assertScroll = (
  x: number,
  y: number,
  status: string,
  reg2000: number,
  nes: Nes
) => {
  expect(getScrollX(nes)).toBe(x);
  expect(getScrollY(nes)).toBe(y);
  expect(getScrollStatus(nes)).toBe(status);
  const [data, _nes] = readBusNes(0x2000, nes);
  nes = _nes;
  expect(data).toBe(reg2000);
};
describe("scroll", () => {
  test("writeScroll", () => {
    let nes = initNes();

    assertScroll(0, 0, "X", 0, nes);
    nes = write2005scroll(255, nes);
    assertScroll(255, 0, "Y", 1, nes);
    nes = write2005scroll(240, nes);
    assertScroll(255, 240, "X", (1 << 1) | 1, nes);
  });

  test("writeScroll Error", () => {
    let nes = initNes();

    expect(() => {
      write2005scroll(257, nes);
    }).toThrow("X scroll out of bound");

    expect(() => {
      nes = write2005scroll(125, nes);
      write2005scroll(241, nes);
    }).toThrow("Y scroll out of bound");
  });

  test("writeScroll reg operator", () => {
    let nes = initNes();

    assertScroll(0, 0, "X", 0, nes);
    nes = writeBusNes(0x2005, 255, nes);
    assertScroll(255, 0, "Y", 1, nes);
    nes = writeBusNes(0x2005, 240, nes);
    assertScroll(255, 240, "X", (1 << 1) | 1, nes);
  });
});
