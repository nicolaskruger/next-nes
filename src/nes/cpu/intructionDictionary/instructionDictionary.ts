import { Nes } from "@/nes/nes";
import {
  ABS,
  ABSX,
  ABSX_ADDR,
  ABSY,
  ABSY_ADDR,
  ABS_ADDR,
  ACC,
  Addr,
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
  INX,
  INY,
  Instruction,
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
  XXX,
} from "../instruction/instruction";
import { Dictionary } from "@/nes/helper/dictionary";

export type InstructionDictionary = {
  addr: (nes: Nes) => Addr;
  instruction: (instruction: Instruction) => Nes;
};

const instructionDictionary: Dictionary<number, InstructionDictionary> = {
  0x69: {
    addr: IMM,
    instruction: ADC,
  },
  0x65: {
    addr: ZERO_PAGE,
    instruction: ADC,
  },
  0x75: {
    addr: ZERO_PAGE_X,

    instruction: ADC,
  },
  0x6d: {
    addr: ABS,
    instruction: ADC,
  },
  0x7d: {
    addr: ABSX,
    instruction: ADC,
  },
  0x79: {
    addr: ABSY,
    instruction: ADC,
  },
  0x61: {
    addr: INDEXED_INDIRECT,
    instruction: ADC,
  },
  0x71: {
    addr: INDIRECT_INDEXED,
    instruction: ADC,
  },
  0x29: {
    addr: IMM,
    instruction: AND,
  },
  0x25: {
    addr: ZERO_PAGE,
    instruction: AND,
  },
  0x35: {
    addr: ZERO_PAGE_X,
    instruction: AND,
  },
  0x2d: {
    addr: ABS,
    instruction: AND,
  },
  0x3d: {
    addr: ABSX,
    instruction: AND,
  },
  0x39: {
    addr: ABSY,
    instruction: AND,
  },
  0x21: {
    addr: INDEXED_INDIRECT,
    instruction: AND,
  },
  0x31: {
    addr: INDIRECT_INDEXED,
    instruction: AND,
  },
  0x0a: {
    addr: ACC,
    instruction: ASL,
  },
  0x06: {
    addr: ZERO_PAGE,
    instruction: ASL,
  },
  0x16: {
    addr: ZERO_PAGE_X,
    instruction: ASL,
  },
  0x0e: {
    addr: ABS,
    instruction: ASL,
  },
  0x1e: {
    addr: ABSX,
    instruction: ASL,
  },
  0x90: {
    addr: RELATIVE,
    instruction: BCC,
  },
  0xb0: {
    addr: RELATIVE,
    instruction: BCS,
  },
  0xf0: {
    addr: RELATIVE,
    instruction: BEQ,
  },
  0x24: {
    addr: ZERO_PAGE,
    instruction: BIT,
  },
  0x2c: {
    addr: ABS,
    instruction: BIT,
  },
  0x30: {
    addr: RELATIVE,
    instruction: BMI,
  },
  0xd0: {
    addr: RELATIVE,
    instruction: BNE,
  },
  0x10: {
    addr: RELATIVE,
    instruction: BPL,
  },
  0x00: {
    addr: IMP,
    instruction: BRK,
  },
  0x50: {
    addr: RELATIVE,
    instruction: BVC,
  },
  0x70: {
    addr: RELATIVE,
    instruction: BVS,
  },
  0x18: {
    addr: IMP,
    instruction: CLC,
  },
  0xd8: {
    addr: IMP,
    instruction: CLD,
  },
  0x58: {
    addr: IMP,
    instruction: CLI,
  },
  0xb8: {
    addr: IMP,
    instruction: CLV,
  },
  0xc9: {
    addr: IMM,
    instruction: CMP,
  },
  0xc5: {
    addr: ZERO_PAGE,
    instruction: CMP,
  },
  0xd5: {
    addr: ZERO_PAGE_X,
    instruction: CMP,
  },
  0xcd: {
    addr: ABS,
    instruction: CMP,
  },
  0xdd: {
    addr: ABSX,
    instruction: CMP,
  },
  0xd9: {
    addr: ABSY,
    instruction: CMP,
  },
  0xc1: {
    addr: INDEXED_INDIRECT,
    instruction: CMP,
  },
  0xd1: {
    addr: INDIRECT_INDEXED,
    instruction: CMP,
  },
  0xe0: {
    addr: IMM,
    instruction: CPX,
  },
  0xe4: {
    addr: ZERO_PAGE,
    instruction: CPX,
  },
  0xec: {
    addr: ABS,
    instruction: CPX,
  },
  0xc0: {
    addr: IMM,
    instruction: CPY,
  },
  0xc4: {
    addr: ZERO_PAGE,
    instruction: CPY,
  },
  0xcc: {
    addr: ABS,
    instruction: CPY,
  },
  0xc6: {
    addr: ZERO_PAGE,
    instruction: DEC,
  },
  0xd6: {
    addr: ZERO_PAGE_X,
    instruction: DEC,
  },
  0xce: {
    addr: ABS_ADDR,
    instruction: DEC,
  },
  0xde: {
    addr: ABSX_ADDR,
    instruction: DEC,
  },
  0xca: {
    addr: IMP,
    instruction: DEX,
  },
  0x88: {
    addr: IMP,
    instruction: DEY,
  },
  0x49: {
    addr: IMM,
    instruction: EOR,
  },
  0x45: {
    addr: ZERO_PAGE,
    instruction: EOR,
  },
  0x55: {
    addr: ZERO_PAGE_X,
    instruction: EOR,
  },
  0x4d: {
    addr: ABS,
    instruction: EOR,
  },
  0x5d: {
    addr: ABSX,
    instruction: EOR,
  },
  0x59: {
    addr: ABSY,
    instruction: EOR,
  },
  0x41: {
    addr: INDEXED_INDIRECT,
    instruction: EOR,
  },
  0x51: {
    addr: INDIRECT_INDEXED,
    instruction: EOR,
  },
  0xe6: {
    addr: ZERO_PAGE,
    instruction: INC,
  },
  0xf6: {
    addr: ZERO_PAGE_X,
    instruction: INC,
  },
  0xee: {
    addr: ABS_ADDR,
    instruction: INC,
  },
  0xfe: {
    addr: ABSX_ADDR,
    instruction: INC,
  },
  0xe8: {
    addr: IMP,
    instruction: INX,
  },
  0xc8: {
    addr: IMP,
    instruction: INY,
  },
  0x4c: {
    addr: ABS,
    instruction: JMP,
  },
  0x6c: {
    addr: INDIRECT,
    instruction: JMP,
  },
  0x20: {
    addr: ABS,
    instruction: JSR,
  },
  0xa9: {
    addr: IMM,
    instruction: LDA,
  },
  0xa5: {
    addr: ZERO_PAGE,
    instruction: LDA,
  },
  0xb5: {
    addr: ZERO_PAGE_X,
    instruction: LDA,
  },
  0xad: {
    addr: ABS,
    instruction: LDA,
  },
  0xbd: {
    addr: ABSX,
    instruction: LDA,
  },
  0xb9: {
    addr: ABSY,
    instruction: LDA,
  },
  0xa1: {
    addr: INDEXED_INDIRECT,
    instruction: LDA,
  },
  0xb1: {
    addr: INDIRECT_INDEXED,
    instruction: LDA,
  },
  0xa2: {
    addr: IMM,
    instruction: LDX,
  },
  0xa6: {
    addr: ZERO_PAGE,
    instruction: LDX,
  },
  0xb6: {
    addr: ZERO_PAGE_Y,
    instruction: LDX,
  },
  0xae: {
    addr: ABS,
    instruction: LDX,
  },
  0xbe: {
    addr: ABSY,
    instruction: LDX,
  },
  0xa0: {
    addr: IMM,
    instruction: LDY,
  },
  0xa4: {
    addr: ZERO_PAGE,
    instruction: LDY,
  },
  0xb4: {
    addr: ZERO_PAGE_X,
    instruction: LDY,
  },
  0xac: {
    addr: ABS,
    instruction: LDY,
  },
  0xbc: {
    addr: ABSX,
    instruction: LDY,
  },
  0x4a: {
    addr: ACC,
    instruction: LSR,
  },
  0x46: {
    addr: ZERO_PAGE,
    instruction: LSR,
  },
  0x56: {
    addr: ZERO_PAGE_X,
    instruction: LSR,
  },
  0x4e: {
    addr: ABS,
    instruction: LSR,
  },
  0x5e: {
    addr: ABSX,
    instruction: LSR,
  },
  0xea: {
    addr: IMP,
    instruction: NOP,
  },
  0x09: {
    addr: IMM,
    instruction: ORA,
  },
  0x05: {
    addr: ZERO_PAGE,
    instruction: ORA,
  },
  0x15: {
    addr: ZERO_PAGE_X,
    instruction: ORA,
  },
  0x0d: {
    addr: ABS,
    instruction: ORA,
  },
  0x1d: {
    addr: ABSX,
    instruction: ORA,
  },
  0x19: {
    addr: ABSY,
    instruction: ORA,
  },
  0x01: {
    addr: INDEXED_INDIRECT,
    instruction: ORA,
  },
  0x11: {
    addr: INDIRECT_INDEXED,
    instruction: ORA,
  },
  0x48: {
    addr: IMP,
    instruction: PHA,
  },
  0x08: {
    addr: IMP,
    instruction: PHP,
  },
  0x68: {
    addr: IMP,
    instruction: PLA,
  },
  0x28: {
    addr: IMP,
    instruction: PLP,
  },
  0x2a: {
    addr: ACC,
    instruction: ROL,
  },
  0x26: {
    addr: ZERO_PAGE,
    instruction: ROL,
  },
  0x36: {
    addr: ZERO_PAGE_X,
    instruction: ROL,
  },
  0x2e: {
    addr: ABS,
    instruction: ROL,
  },
  0x3e: {
    addr: ABSX,
    instruction: ROL,
  },
  0x6a: {
    addr: ACC,
    instruction: ROR,
  },
  0x66: {
    addr: ZERO_PAGE,
    instruction: ROR,
  },
  0x76: {
    addr: ZERO_PAGE_X,
    instruction: ROR,
  },
  0x6e: {
    addr: ABS,
    instruction: ROR,
  },
  0x7e: {
    addr: ABSX,
    instruction: ROR,
  },
  0x40: {
    addr: IMP,
    instruction: RTI,
  },
  0x60: {
    addr: IMP,
    instruction: RTS,
  },
  0xe9: {
    addr: IMM,
    instruction: SBC,
  },
  0xe5: {
    addr: ZERO_PAGE,
    instruction: SBC,
  },
  0xf5: {
    addr: ZERO_PAGE_X,
    instruction: SBC,
  },
  0xed: {
    addr: ABS,
    instruction: SBC,
  },
  0xfd: {
    addr: ABSX,
    instruction: SBC,
  },
  0xf9: {
    addr: ABSY,
    instruction: SBC,
  },
  0xe1: {
    addr: INDEXED_INDIRECT,
    instruction: SBC,
  },
  0xf1: {
    addr: INDIRECT_INDEXED,
    instruction: SBC,
  },
  0x38: {
    addr: IMP,
    instruction: SEC,
  },
  0xf8: {
    addr: IMP,
    instruction: SED,
  },
  0x78: {
    addr: IMP,
    instruction: SEI,
  },
  0x85: {
    addr: ZERO_PAGE,
    instruction: STA,
  },
  0x95: {
    addr: ZERO_PAGE_X,
    instruction: STA,
  },
  0x8d: {
    addr: ABS_ADDR,
    instruction: STA,
  },
  0x9d: {
    addr: ABSX_ADDR,
    instruction: STA,
  },
  0x99: {
    addr: ABSY_ADDR,
    instruction: STA,
  },
  0x81: {
    addr: INDEXED_INDIRECT_ADDR,
    instruction: STA,
  },
  0x91: {
    addr: INDIRECT_INDEXED_ADDR,
    instruction: STA,
  },
  0x86: {
    addr: ZERO_PAGE,
    instruction: STX,
  },
  0x96: {
    addr: ZERO_PAGE_Y,
    instruction: STX,
  },
  0x8e: {
    addr: ABS_ADDR,
    instruction: STX,
  },
  0x84: {
    addr: ZERO_PAGE,
    instruction: STY,
  },
  0x94: {
    addr: ZERO_PAGE_X,
    instruction: STY,
  },
  0x8c: {
    addr: ABS_ADDR,
    instruction: STY,
  },
  0xaa: {
    addr: IMP,
    instruction: TAX,
  },
  0xa8: {
    addr: IMP,
    instruction: TAY,
  },
  0xba: {
    addr: IMP,
    instruction: TSX,
  },
  0x8a: {
    addr: IMP,
    instruction: TXA,
  },
  0x9a: {
    addr: IMP,
    instruction: TXS,
  },
  0x98: {
    addr: IMP,
    instruction: TYA,
  },
};

export const getInstructions = (opCode: number): InstructionDictionary => {
  const instruction = instructionDictionary[opCode];
  if (!instruction)
    return {
      addr: IMP,
      instruction: XXX,
    };
  return instruction;
};

export { instructionDictionary };
