import {
  ABS,
  ABSX,
  ABSY,
  IMM,
  INDEXED_INDIRECT,
  INDIRECT_INDEXED,
  ZERO_PAGE,
  ZERO_PAGE_X,
} from "../addr/addr";
import { ADC, AND } from "../instruction/instruction";
import {
  InstructionDictionary,
  instructionDictionary,
} from "./instructionDictionary";

type Dict = typeof instructionDictionary;

type Inst = typeof ADC;

function expectDictionary(dict: Dict, inst: Inst) {
  return {
    toBe: (
      index: number,
      instruction: Omit<InstructionDictionary, "instruction">
    ) => {
      expect(dict[index]).toStrictEqual({ ...instruction, instruction: inst });
      return expectDictionary(dict, inst);
    },
  };
}

describe("test instruction dictionary", () => {
  test("ADC", () => {
    expectDictionary(instructionDictionary, ADC)
      .toBe(0x69, {
        baseCycles: 2,
        offsetCycles: 0,
        addr: IMM,
      })
      .toBe(0x65, {
        baseCycles: 3,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0x75, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ZERO_PAGE_X,
      })
      .toBe(0x6d, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ABS,
      })
      .toBe(0x7d, {
        baseCycles: 4,
        offsetCycles: 1,
        addr: ABSX,
      })
      .toBe(0x79, {
        baseCycles: 4,
        offsetCycles: 1,
        addr: ABSY,
      })
      .toBe(0x61, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: INDEXED_INDIRECT,
      })
      .toBe(0x71, {
        baseCycles: 5,
        offsetCycles: 1,
        addr: INDIRECT_INDEXED,
      });
  });
  test("AND", () => {
    expectDictionary(instructionDictionary, AND)
      .toBe(0x29, {
        baseCycles: 2,
        offsetCycles: 0,
        addr: IMM,
      })
      .toBe(0x25, {
        baseCycles: 3,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0x35, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ZERO_PAGE_X,
      })
      .toBe(0x2d, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ABS,
      })
      .toBe(0x3d, {
        baseCycles: 4,
        offsetCycles: 1,
        addr: ABSX,
      })
      .toBe(0x39, {
        baseCycles: 4,
        offsetCycles: 1,
        addr: ABSY,
      })
      .toBe(0x21, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: INDEXED_INDIRECT,
      })
      .toBe(0x31, {
        baseCycles: 5,
        offsetCycles: 1,
        addr: INDIRECT_INDEXED,
      });
  });
});
