import {
  ABS,
  ABSX,
  ABSX_ADDR,
  ABSY,
  ABSY_ADDR,
  ABS_ADDR,
  ACC,
  IMM,
  IMP,
  INDEXED_INDIRECT,
  INDEXED_INDIRECT_ADDR,
  INDIRECT,
  INDIRECT_INDEXED,
  INDIRECT_INDEXED_ADDR,
  RELATIVE,
  ZERO_PAGE,
  ZERO_PAGE_X,
  ZERO_PAGE_Y,
} from "../addr/addr";
import {
  ADC,
  AND,
  ASL,
  BCC,
  BCS,
  BEQ,
  BIT,
  BMI,
  BNE,
  BPL,
  BRK,
  BVC,
  BVS,
  CLC,
  CLD,
  CLI,
  CLV,
  CMP,
  CPX,
  CPY,
  DEC,
  DEX,
  DEY,
  EOR,
  INC,
  INY,
  JMP,
  JSR,
  LDA,
  LDX,
  LDY,
  LSR,
  NOP,
  ORA,
  PHA,
  PHP,
  PLA,
  PLP,
  ROL,
  ROR,
  RTI,
  RTS,
  SBC,
  SEC,
  SED,
  SEI,
  STA,
  STX,
  STY,
  TAX,
  TAY,
  TSX,
  TXA,
  TXS,
  TYA,
} from "../instruction/instruction";
import {
  InstructionDictionary,
  instructionDictionary,
} from "./instructionDictionary";

type Dict = typeof instructionDictionary;

type Inst = typeof ADC;

function expectDictionary(inst: Inst) {
  const dict = instructionDictionary;
  return {
    toBe: (
      index: number,
      instruction: Omit<InstructionDictionary, "instruction">
    ) => {
      expect(dict[index]).toStrictEqual({ ...instruction, instruction: inst });
      return expectDictionary(inst);
    },
  };
}

describe("test instruction dictionary", () => {
  test("ADC", () => {
    expectDictionary(ADC)
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
    expectDictionary(AND)
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
  test("ASL", () => {
    expectDictionary(ASL)
      .toBe(0x0a, {
        baseCycles: 2,
        offsetCycles: 0,
        addr: ACC,
      })
      .toBe(0x06, {
        baseCycles: 5,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0x16, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: ZERO_PAGE_X,
      })
      .toBe(0x0e, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: ABS,
      })
      .toBe(0x1e, {
        baseCycles: 7,
        offsetCycles: 0,
        addr: ABSX,
      });
  });

  test("BCC", () => {
    expectDictionary(BCC).toBe(0x90, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: RELATIVE,
    });
  });

  test("BCS", () => {
    expectDictionary(BCS).toBe(0xb0, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: RELATIVE,
    });
  });
  test("BEQ", () => {
    expectDictionary(BEQ).toBe(0xf0, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: RELATIVE,
    });
  });
  test("BIT", () => {
    expectDictionary(BIT)
      .toBe(0x24, {
        baseCycles: 3,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0x2c, { baseCycles: 4, offsetCycles: 0, addr: ABS });
  });

  test("BMI", () => {
    expectDictionary(BMI).toBe(0x30, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: RELATIVE,
    });
  });

  test("BNE", () => {
    expectDictionary(BNE).toBe(0xd0, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: RELATIVE,
    });
  });

  test("BPL", () => {
    expectDictionary(BPL).toBe(0x10, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: RELATIVE,
    });
  });

  test("BRK", () => {
    expectDictionary(BRK).toBe(0x00, {
      baseCycles: 7,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("BVC", () => {
    expectDictionary(BVC).toBe(0x50, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: RELATIVE,
    });
  });

  test("BVS", () => {
    expectDictionary(BVS).toBe(0x70, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: RELATIVE,
    });
  });

  test("CLC", () => {
    expectDictionary(CLC).toBe(0x18, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("CLD", () => {
    expectDictionary(CLD).toBe(0xd8, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("CLI", () => {
    expectDictionary(CLI).toBe(0x58, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("CLV", () => {
    expectDictionary(CLV).toBe(0xb8, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("CMP", () => {
    expectDictionary(CMP)
      .toBe(0xc9, {
        baseCycles: 2,
        offsetCycles: 0,
        addr: IMM,
      })
      .toBe(0xc5, {
        baseCycles: 3,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0xd5, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ZERO_PAGE_X,
      })
      .toBe(0xcd, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ABS,
      })
      .toBe(0xdd, {
        baseCycles: 4,
        offsetCycles: 1,
        addr: ABSX,
      })
      .toBe(0xd9, {
        baseCycles: 4,
        offsetCycles: 1,
        addr: ABSY,
      })
      .toBe(0xc1, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: INDEXED_INDIRECT,
      })
      .toBe(0xd1, {
        baseCycles: 5,
        offsetCycles: 1,
        addr: INDIRECT_INDEXED,
      });
  });

  test("CPX", () => {
    expectDictionary(CPX)
      .toBe(0xe0, {
        baseCycles: 2,
        offsetCycles: 0,
        addr: IMM,
      })
      .toBe(0xe4, {
        baseCycles: 3,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0xec, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ABS,
      });
  });

  test("CPY", () => {
    expectDictionary(CPY)
      .toBe(0xc0, {
        baseCycles: 2,
        offsetCycles: 0,
        addr: IMM,
      })
      .toBe(0xc4, {
        baseCycles: 3,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0xcc, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ABS,
      });
  });

  test("DEC", () => {
    expectDictionary(DEC)
      .toBe(0xc6, {
        baseCycles: 5,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0xd6, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: ZERO_PAGE_X,
      })
      .toBe(0xce, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: ABS,
      })
      .toBe(0xde, {
        baseCycles: 7,
        offsetCycles: 0,
        addr: ABSX,
      });
  });

  test("DEX", () => {
    expectDictionary(DEX).toBe(0xca, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("DEY", () => {
    expectDictionary(DEY).toBe(0x88, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: IMP,
    });
  });
  test("EOR", () => {
    expectDictionary(EOR)
      .toBe(0x49, {
        baseCycles: 2,
        offsetCycles: 0,
        addr: IMM,
      })
      .toBe(0x45, {
        baseCycles: 3,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0x55, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ZERO_PAGE_X,
      })
      .toBe(0x4d, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ABS,
      })
      .toBe(0x5d, {
        baseCycles: 4,
        offsetCycles: 1,
        addr: ABSX,
      })
      .toBe(0x59, {
        baseCycles: 4,
        offsetCycles: 1,
        addr: ABSY,
      })
      .toBe(0x41, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: INDEXED_INDIRECT,
      })
      .toBe(0x51, {
        baseCycles: 5,
        offsetCycles: 1,
        addr: INDIRECT_INDEXED,
      });
  });

  test("INC", () => {
    expectDictionary(INC)
      .toBe(0xe6, {
        baseCycles: 5,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0xf6, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: ZERO_PAGE_X,
      })
      .toBe(0xee, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: ABS,
      })
      .toBe(0xfe, {
        baseCycles: 7,
        offsetCycles: 0,
        addr: ABSX,
      });
  });

  test("INY", () => {
    expectDictionary(INY).toBe(0xc8, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("JMP", () => {
    expectDictionary(JMP)
      .toBe(0x4c, {
        baseCycles: 3,
        offsetCycles: 0,
        addr: ABS,
      })
      .toBe(0x6c, {
        baseCycles: 5,
        offsetCycles: 0,
        addr: INDIRECT,
      });
  });

  test("JSR", () => {
    expectDictionary(JSR).toBe(0x20, {
      baseCycles: 6,
      offsetCycles: 0,
      addr: ABS,
    });
  });

  test("LDA", () => {
    expectDictionary(LDA)
      .toBe(0xa9, {
        baseCycles: 2,
        offsetCycles: 0,
        addr: IMM,
      })
      .toBe(0xa5, {
        baseCycles: 3,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0xb5, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ZERO_PAGE_X,
      })
      .toBe(0xad, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ABS,
      })
      .toBe(0xbd, {
        baseCycles: 4,
        offsetCycles: 1,
        addr: ABSX,
      })
      .toBe(0xb9, {
        baseCycles: 4,
        offsetCycles: 1,
        addr: ABSY,
      })
      .toBe(0xa1, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: INDEXED_INDIRECT,
      })
      .toBe(0xb1, {
        baseCycles: 5,
        offsetCycles: 1,
        addr: INDIRECT_INDEXED,
      });
  });

  test("LDX", () => {
    expectDictionary(LDX)
      .toBe(0xa2, {
        baseCycles: 2,
        offsetCycles: 0,
        addr: IMM,
      })
      .toBe(0xa6, {
        baseCycles: 3,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0xb6, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ZERO_PAGE_Y,
      })
      .toBe(0xae, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ABS,
      })
      .toBe(0xbe, {
        baseCycles: 4,
        offsetCycles: 1,
        addr: ABSY,
      });
  });

  test("LDY", () => {
    expectDictionary(LDY)
      .toBe(0xa0, {
        baseCycles: 2,
        offsetCycles: 0,
        addr: IMM,
      })
      .toBe(0xa4, {
        baseCycles: 3,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0xb4, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ZERO_PAGE_X,
      })
      .toBe(0xac, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ABS,
      })
      .toBe(0xbc, {
        baseCycles: 4,
        offsetCycles: 1,
        addr: ABSX,
      });
  });

  test("LSR", () => {
    expectDictionary(LSR)
      .toBe(0x4a, {
        baseCycles: 2,
        offsetCycles: 0,
        addr: ACC,
      })
      .toBe(0x46, {
        baseCycles: 5,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0x56, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: ZERO_PAGE_X,
      })
      .toBe(0x4e, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: ABS,
      })
      .toBe(0x5e, {
        baseCycles: 7,
        offsetCycles: 0,
        addr: ABSX,
      });
  });

  test("NOP", () => {
    expectDictionary(NOP).toBe(0xea, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("ORA", () => {
    expectDictionary(ORA)
      .toBe(0x09, {
        baseCycles: 2,
        offsetCycles: 0,
        addr: IMM,
      })
      .toBe(0x05, {
        baseCycles: 3,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0x15, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ZERO_PAGE_X,
      })
      .toBe(0x0d, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ABS,
      })
      .toBe(0x1d, {
        baseCycles: 4,
        offsetCycles: 1,
        addr: ABSX,
      })
      .toBe(0x19, {
        baseCycles: 4,
        offsetCycles: 1,
        addr: ABSY,
      })
      .toBe(0x01, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: INDEXED_INDIRECT,
      })
      .toBe(0x11, {
        baseCycles: 5,
        offsetCycles: 1,
        addr: INDIRECT_INDEXED,
      });
  });
  test("PHA", () => {
    expectDictionary(PHA).toBe(0x48, {
      baseCycles: 3,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("PHP", () => {
    expectDictionary(PHP).toBe(0x08, {
      baseCycles: 3,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("PLA", () => {
    expectDictionary(PLA).toBe(0x68, {
      baseCycles: 4,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("PLP", () => {
    expectDictionary(PLP).toBe(0x28, {
      baseCycles: 4,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("ROL", () => {
    expectDictionary(ROL)
      .toBe(0x2a, {
        baseCycles: 2,
        offsetCycles: 0,
        addr: ACC,
      })
      .toBe(0x26, {
        baseCycles: 5,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0x36, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: ZERO_PAGE_X,
      })
      .toBe(0x2e, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: ABS,
      })
      .toBe(0x3e, {
        baseCycles: 7,
        offsetCycles: 0,
        addr: ABSX,
      });
  });

  test("ROR", () => {
    expectDictionary(ROR)
      .toBe(0x6a, {
        baseCycles: 2,
        offsetCycles: 0,
        addr: ACC,
      })
      .toBe(0x66, {
        baseCycles: 5,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0x76, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: ZERO_PAGE_X,
      })
      .toBe(0x6e, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: ABS,
      })
      .toBe(0x7e, {
        baseCycles: 7,
        offsetCycles: 0,
        addr: ABSX,
      });
  });

  test("RTI", () => {
    expectDictionary(RTI).toBe(0x40, {
      baseCycles: 6,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("RTS", () => {
    expectDictionary(RTS).toBe(0x60, {
      baseCycles: 6,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("SBC", () => {
    expectDictionary(SBC)
      .toBe(0xe9, {
        baseCycles: 2,
        offsetCycles: 0,
        addr: IMM,
      })
      .toBe(0xe5, {
        baseCycles: 3,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0xf5, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ZERO_PAGE_X,
      })
      .toBe(0xed, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ABS,
      })
      .toBe(0xfd, {
        baseCycles: 4,
        offsetCycles: 1,
        addr: ABSX,
      })
      .toBe(0xf9, {
        baseCycles: 4,
        offsetCycles: 1,
        addr: ABSY,
      })
      .toBe(0xe1, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: INDEXED_INDIRECT,
      })
      .toBe(0xf1, {
        baseCycles: 5,
        offsetCycles: 1,
        addr: INDIRECT_INDEXED,
      });
  });

  test("SEC", () => {
    expectDictionary(SEC).toBe(0x38, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("SED", () => {
    expectDictionary(SED).toBe(0xf8, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("SEI", () => {
    expectDictionary(SEI).toBe(0x78, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("STA", () => {
    expectDictionary(STA)
      .toBe(0x85, {
        baseCycles: 3,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0x95, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ZERO_PAGE_X,
      })
      .toBe(0x8d, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ABS_ADDR,
      })
      .toBe(0x9d, {
        baseCycles: 5,
        offsetCycles: 0,
        addr: ABSX_ADDR,
      })
      .toBe(0x99, {
        baseCycles: 5,
        offsetCycles: 0,
        addr: ABSY_ADDR,
      })
      .toBe(0x81, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: INDEXED_INDIRECT_ADDR,
      })
      .toBe(0x91, {
        baseCycles: 6,
        offsetCycles: 0,
        addr: INDIRECT_INDEXED_ADDR,
      });
  });

  test("STX", () => {
    expectDictionary(STX)
      .toBe(0x86, {
        baseCycles: 3,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0x96, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ZERO_PAGE_Y,
      })
      .toBe(0x8e, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ABS,
      });
  });

  test("STY", () => {
    expectDictionary(STY)
      .toBe(0x84, {
        baseCycles: 3,
        offsetCycles: 0,
        addr: ZERO_PAGE,
      })
      .toBe(0x94, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ZERO_PAGE_X,
      })
      .toBe(0x8c, {
        baseCycles: 4,
        offsetCycles: 0,
        addr: ABS,
      });
  });

  test("TAX", () => {
    expectDictionary(TAX).toBe(0xaa, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("TAY", () => {
    expectDictionary(TAY).toBe(0xa8, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("TSX", () => {
    expectDictionary(TSX).toBe(0xba, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("TXA", () => {
    expectDictionary(TXA).toBe(0x8a, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("TXS", () => {
    expectDictionary(TXS).toBe(0x9a, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: IMP,
    });
  });

  test("TYA", () => {
    expectDictionary(TYA).toBe(0x98, {
      baseCycles: 2,
      offsetCycles: 0,
      addr: IMP,
    });
  });
});
