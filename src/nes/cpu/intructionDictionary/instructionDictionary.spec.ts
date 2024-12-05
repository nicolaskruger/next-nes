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
        addr: IMM,
      })
      .toBe(0x65, {
        addr: ZERO_PAGE,
      })
      .toBe(0x75, {
        addr: ZERO_PAGE_X,
      })
      .toBe(0x6d, {
        addr: ABS,
      })
      .toBe(0x7d, {
        addr: ABSX,
      })
      .toBe(0x79, {
        addr: ABSY,
      })
      .toBe(0x61, {
        addr: INDEXED_INDIRECT,
      })
      .toBe(0x71, {
        addr: INDIRECT_INDEXED,
      });
  });
  test("AND", () => {
    expectDictionary(AND)
      .toBe(0x29, {
        addr: IMM,
      })
      .toBe(0x25, {
        addr: ZERO_PAGE,
      })
      .toBe(0x35, {
        addr: ZERO_PAGE_X,
      })
      .toBe(0x2d, {
        addr: ABS,
      })
      .toBe(0x3d, {
        addr: ABSX,
      })
      .toBe(0x39, {
        addr: ABSY,
      })
      .toBe(0x21, {
        addr: INDEXED_INDIRECT,
      })
      .toBe(0x31, {
        addr: INDIRECT_INDEXED,
      });
  });
  test("ASL", () => {
    expectDictionary(ASL)
      .toBe(0x0a, {
        addr: ACC,
      })
      .toBe(0x06, {
        addr: ZERO_PAGE,
      })
      .toBe(0x16, {
        addr: ZERO_PAGE_X,
      })
      .toBe(0x0e, {
        addr: ABS,
      })
      .toBe(0x1e, {
        addr: ABSX,
      });
  });

  test("BCC", () => {
    expectDictionary(BCC).toBe(0x90, {
      addr: RELATIVE,
    });
  });

  test("BCS", () => {
    expectDictionary(BCS).toBe(0xb0, {
      addr: RELATIVE,
    });
  });
  test("BEQ", () => {
    expectDictionary(BEQ).toBe(0xf0, {
      addr: RELATIVE,
    });
  });
  test("BIT", () => {
    expectDictionary(BIT)
      .toBe(0x24, {
        addr: ZERO_PAGE,
      })
      .toBe(0x2c, { addr: ABS });
  });

  test("BMI", () => {
    expectDictionary(BMI).toBe(0x30, {
      addr: RELATIVE,
    });
  });

  test("BNE", () => {
    expectDictionary(BNE).toBe(0xd0, {
      addr: RELATIVE,
    });
  });

  test("BPL", () => {
    expectDictionary(BPL).toBe(0x10, {
      addr: RELATIVE,
    });
  });

  test("BRK", () => {
    expectDictionary(BRK).toBe(0x00, {
      addr: IMP,
    });
  });

  test("BVC", () => {
    expectDictionary(BVC).toBe(0x50, {
      addr: RELATIVE,
    });
  });

  test("BVS", () => {
    expectDictionary(BVS).toBe(0x70, {
      addr: RELATIVE,
    });
  });

  test("CLC", () => {
    expectDictionary(CLC).toBe(0x18, {
      addr: IMP,
    });
  });

  test("CLD", () => {
    expectDictionary(CLD).toBe(0xd8, {
      addr: IMP,
    });
  });

  test("CLI", () => {
    expectDictionary(CLI).toBe(0x58, {
      addr: IMP,
    });
  });

  test("CLV", () => {
    expectDictionary(CLV).toBe(0xb8, {
      addr: IMP,
    });
  });

  test("CMP", () => {
    expectDictionary(CMP)
      .toBe(0xc9, {
        addr: IMM,
      })
      .toBe(0xc5, {
        addr: ZERO_PAGE,
      })
      .toBe(0xd5, {
        addr: ZERO_PAGE_X,
      })
      .toBe(0xcd, {
        addr: ABS,
      })
      .toBe(0xdd, {
        addr: ABSX,
      })
      .toBe(0xd9, {
        addr: ABSY,
      })
      .toBe(0xc1, {
        addr: INDEXED_INDIRECT,
      })
      .toBe(0xd1, {
        addr: INDIRECT_INDEXED,
      });
  });

  test("CPX", () => {
    expectDictionary(CPX)
      .toBe(0xe0, {
        addr: IMM,
      })
      .toBe(0xe4, {
        addr: ZERO_PAGE,
      })
      .toBe(0xec, {
        addr: ABS,
      });
  });

  test("CPY", () => {
    expectDictionary(CPY)
      .toBe(0xc0, {
        addr: IMM,
      })
      .toBe(0xc4, {
        addr: ZERO_PAGE,
      })
      .toBe(0xcc, {
        addr: ABS,
      });
  });

  test("DEC", () => {
    expectDictionary(DEC)
      .toBe(0xc6, {
        addr: ZERO_PAGE,
      })
      .toBe(0xd6, {
        addr: ZERO_PAGE_X,
      })
      .toBe(0xce, {
        addr: ABS_ADDR,
      })
      .toBe(0xde, {
        addr: ABSX_ADDR,
      });
  });

  test("DEX", () => {
    expectDictionary(DEX).toBe(0xca, {
      addr: IMP,
    });
  });

  test("DEY", () => {
    expectDictionary(DEY).toBe(0x88, {
      addr: IMP,
    });
  });
  test("EOR", () => {
    expectDictionary(EOR)
      .toBe(0x49, {
        addr: IMM,
      })
      .toBe(0x45, {
        addr: ZERO_PAGE,
      })
      .toBe(0x55, {
        addr: ZERO_PAGE_X,
      })
      .toBe(0x4d, {
        addr: ABS,
      })
      .toBe(0x5d, {
        addr: ABSX,
      })
      .toBe(0x59, {
        addr: ABSY,
      })
      .toBe(0x41, {
        addr: INDEXED_INDIRECT,
      })
      .toBe(0x51, {
        addr: INDIRECT_INDEXED,
      });
  });

  test("INC", () => {
    expectDictionary(INC)
      .toBe(0xe6, {
        addr: ZERO_PAGE,
      })
      .toBe(0xf6, {
        addr: ZERO_PAGE_X,
      })
      .toBe(0xee, {
        addr: ABS_ADDR,
      })
      .toBe(0xfe, {
        addr: ABSX_ADDR,
      });
  });

  test("INY", () => {
    expectDictionary(INY).toBe(0xc8, {
      addr: IMP,
    });
  });

  test("JMP", () => {
    expectDictionary(JMP)
      .toBe(0x4c, {
        addr: ABS,
      })
      .toBe(0x6c, {
        addr: INDIRECT,
      });
  });

  test("JSR", () => {
    expectDictionary(JSR).toBe(0x20, {
      addr: ABS,
    });
  });

  test("LDA", () => {
    expectDictionary(LDA)
      .toBe(0xa9, {
        addr: IMM,
      })
      .toBe(0xa5, {
        addr: ZERO_PAGE,
      })
      .toBe(0xb5, {
        addr: ZERO_PAGE_X,
      })
      .toBe(0xad, {
        addr: ABS,
      })
      .toBe(0xbd, {
        addr: ABSX,
      })
      .toBe(0xb9, {
        addr: ABSY,
      })
      .toBe(0xa1, {
        addr: INDEXED_INDIRECT,
      })
      .toBe(0xb1, {
        addr: INDIRECT_INDEXED,
      });
  });

  test("LDX", () => {
    expectDictionary(LDX)
      .toBe(0xa2, {
        addr: IMM,
      })
      .toBe(0xa6, {
        addr: ZERO_PAGE,
      })
      .toBe(0xb6, {
        addr: ZERO_PAGE_Y,
      })
      .toBe(0xae, {
        addr: ABS,
      })
      .toBe(0xbe, {
        addr: ABSY,
      });
  });

  test("LDY", () => {
    expectDictionary(LDY)
      .toBe(0xa0, {
        addr: IMM,
      })
      .toBe(0xa4, {
        addr: ZERO_PAGE,
      })
      .toBe(0xb4, {
        addr: ZERO_PAGE_X,
      })
      .toBe(0xac, {
        addr: ABS,
      })
      .toBe(0xbc, {
        addr: ABSX,
      });
  });

  test("LSR", () => {
    expectDictionary(LSR)
      .toBe(0x4a, {
        addr: ACC,
      })
      .toBe(0x46, {
        addr: ZERO_PAGE,
      })
      .toBe(0x56, {
        addr: ZERO_PAGE_X,
      })
      .toBe(0x4e, {
        addr: ABS,
      })
      .toBe(0x5e, {
        addr: ABSX,
      });
  });

  test("NOP", () => {
    expectDictionary(NOP).toBe(0xea, {
      addr: IMP,
    });
  });

  test("ORA", () => {
    expectDictionary(ORA)
      .toBe(0x09, {
        addr: IMM,
      })
      .toBe(0x05, {
        addr: ZERO_PAGE,
      })
      .toBe(0x15, {
        addr: ZERO_PAGE_X,
      })
      .toBe(0x0d, {
        addr: ABS,
      })
      .toBe(0x1d, {
        addr: ABSX,
      })
      .toBe(0x19, {
        addr: ABSY,
      })
      .toBe(0x01, {
        addr: INDEXED_INDIRECT,
      })
      .toBe(0x11, {
        addr: INDIRECT_INDEXED,
      });
  });
  test("PHA", () => {
    expectDictionary(PHA).toBe(0x48, {
      addr: IMP,
    });
  });

  test("PHP", () => {
    expectDictionary(PHP).toBe(0x08, {
      addr: IMP,
    });
  });

  test("PLA", () => {
    expectDictionary(PLA).toBe(0x68, {
      addr: IMP,
    });
  });

  test("PLP", () => {
    expectDictionary(PLP).toBe(0x28, {
      addr: IMP,
    });
  });

  test("ROL", () => {
    expectDictionary(ROL)
      .toBe(0x2a, {
        addr: ACC,
      })
      .toBe(0x26, {
        addr: ZERO_PAGE,
      })
      .toBe(0x36, {
        addr: ZERO_PAGE_X,
      })
      .toBe(0x2e, {
        addr: ABS,
      })
      .toBe(0x3e, {
        addr: ABSX,
      });
  });

  test("ROR", () => {
    expectDictionary(ROR)
      .toBe(0x6a, {
        addr: ACC,
      })
      .toBe(0x66, {
        addr: ZERO_PAGE,
      })
      .toBe(0x76, {
        addr: ZERO_PAGE_X,
      })
      .toBe(0x6e, {
        addr: ABS,
      })
      .toBe(0x7e, {
        addr: ABSX,
      });
  });

  test("RTI", () => {
    expectDictionary(RTI).toBe(0x40, {
      addr: IMP,
    });
  });

  test("RTS", () => {
    expectDictionary(RTS).toBe(0x60, {
      addr: IMP,
    });
  });

  test("SBC", () => {
    expectDictionary(SBC)
      .toBe(0xe9, {
        addr: IMM,
      })
      .toBe(0xe5, {
        addr: ZERO_PAGE,
      })
      .toBe(0xf5, {
        addr: ZERO_PAGE_X,
      })
      .toBe(0xed, {
        addr: ABS,
      })
      .toBe(0xfd, {
        addr: ABSX,
      })
      .toBe(0xf9, {
        addr: ABSY,
      })
      .toBe(0xe1, {
        addr: INDEXED_INDIRECT,
      })
      .toBe(0xf1, {
        addr: INDIRECT_INDEXED,
      });
  });

  test("SEC", () => {
    expectDictionary(SEC).toBe(0x38, {
      addr: IMP,
    });
  });

  test("SED", () => {
    expectDictionary(SED).toBe(0xf8, {
      addr: IMP,
    });
  });

  test("SEI", () => {
    expectDictionary(SEI).toBe(0x78, {
      addr: IMP,
    });
  });

  test("STA", () => {
    expectDictionary(STA)
      .toBe(0x85, {
        addr: ZERO_PAGE,
      })
      .toBe(0x95, {
        addr: ZERO_PAGE_X,
      })
      .toBe(0x8d, {
        addr: ABS_ADDR,
      })
      .toBe(0x9d, {
        addr: ABSX_ADDR,
      })
      .toBe(0x99, {
        addr: ABSY_ADDR,
      })
      .toBe(0x81, {
        addr: INDEXED_INDIRECT_ADDR,
      })
      .toBe(0x91, {
        addr: INDIRECT_INDEXED_ADDR,
      });
  });

  test("STX", () => {
    expectDictionary(STX)
      .toBe(0x86, {
        addr: ZERO_PAGE,
      })
      .toBe(0x96, {
        addr: ZERO_PAGE_Y,
      })
      .toBe(0x8e, {
        addr: ABS_ADDR,
      });
  });

  test("STY", () => {
    expectDictionary(STY)
      .toBe(0x84, {
        addr: ZERO_PAGE,
      })
      .toBe(0x94, {
        addr: ZERO_PAGE_X,
      })
      .toBe(0x8c, {
        addr: ABS_ADDR,
      });
  });

  test("TAX", () => {
    expectDictionary(TAX).toBe(0xaa, {
      addr: IMP,
    });
  });

  test("TAY", () => {
    expectDictionary(TAY).toBe(0xa8, {
      addr: IMP,
    });
  });

  test("TSX", () => {
    expectDictionary(TSX).toBe(0xba, {
      addr: IMP,
    });
  });

  test("TXA", () => {
    expectDictionary(TXA).toBe(0x8a, {
      addr: IMP,
    });
  });

  test("TXS", () => {
    expectDictionary(TXS).toBe(0x9a, {
      addr: IMP,
    });
  });

  test("TYA", () => {
    expectDictionary(TYA).toBe(0x98, {
      addr: IMP,
    });
  });
});
