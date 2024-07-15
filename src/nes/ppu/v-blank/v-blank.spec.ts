import { NMI } from "../../cpu/instruction/instruction";
import { isNMIOccur, toggleVBlack } from "../registers/registers";
import { initNes } from "@/nes/nes";
import { MAX_CYCLES, vBlack } from "./v-blank";

jest.mock("../../cpu/instruction/instruction");
jest.mock("../registers/registers");
describe("v-blank", () => {
  let NMIMocked = jest.mocked(NMI);
  let toggleVBlackMocked = jest.mocked(toggleVBlack);
  let isNMIOccurMocked = jest.mocked(isNMIOccur);
  let nes = initNes();
  beforeEach(() => {
    NMIMocked = jest.mocked(NMI);
    toggleVBlackMocked = jest.mocked(toggleVBlack);
    isNMIOccurMocked = jest.mocked(isNMIOccur);
    nes = initNes();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("should not toggle v-blank when not excede MAX CYCLES", () => {
    nes = vBlack(nes, 0);
    expect(NMIMocked).toHaveBeenCalledTimes(0);
    expect(toggleVBlackMocked).toHaveBeenCalledTimes(0);
  });

  test("should call toggle v-blank when  excede MAX CYCLES", () => {
    isNMIOccurMocked.mockReturnValue([false, nes]);
    nes = vBlack(nes, MAX_CYCLES);
    expect(NMIMocked).toHaveBeenCalledTimes(0);
    expect(toggleVBlackMocked).toHaveBeenCalled();
  });

  test("should call toggle v-blank and call NMI when  excede MAX CYCLES", () => {
    isNMIOccurMocked.mockReturnValue([true, nes]);
    nes = vBlack(nes, MAX_CYCLES);
    expect(NMIMocked).toHaveBeenCalled();
    expect(toggleVBlackMocked).toHaveBeenCalled();
  });
});
