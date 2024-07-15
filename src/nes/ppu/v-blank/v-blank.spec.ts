import { NMI } from "../../cpu/instruction/instruction";
import { isNMIOccur, toggleVBlank } from "../registers/registers";
import { initNes } from "@/nes/nes";
import { MAX_CYCLES, vBlack } from "./v-blank";
import { getCycles } from "../../cpu/cpu";

jest.mock("../../cpu/instruction/instruction");
jest.mock("../registers/registers");
jest.mock("../../cpu/cpu");
describe("v-blank", () => {
  let NMIMocked = jest.mocked(NMI);
  let toggleVBlackMocked = jest.mocked(toggleVBlank);
  let isNMIOccurMocked = jest.mocked(isNMIOccur);
  let getCyclesMocked = jest.mocked(getCycles);
  let nes = initNes();
  beforeEach(() => {
    NMIMocked = jest.mocked(NMI);
    toggleVBlackMocked = jest.mocked(toggleVBlank);
    isNMIOccurMocked = jest.mocked(isNMIOccur);
    getCyclesMocked = jest.mocked(getCycles);
    nes = initNes();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("should not toggle v-blank when not excede MAX CYCLES", () => {
    getCyclesMocked.mockReturnValue(0);
    nes = vBlack(nes);
    expect(NMIMocked).toHaveBeenCalledTimes(0);
    expect(toggleVBlackMocked).toHaveBeenCalledTimes(0);
  });

  test("should call toggle v-blank and NMI when  excede MAX CYCLES", () => {
    getCyclesMocked.mockReturnValue(MAX_CYCLES);
    isNMIOccurMocked.mockReturnValue([false, nes]);
    nes = vBlack(nes);
    expect(NMIMocked).toHaveBeenCalled();
    expect(toggleVBlackMocked).toHaveBeenCalled();
  });
});
