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
} from "../instruction/instruction";
import { Dictionary } from "@/nes/helper/dictionary";

export type InstructionDictionary = {
  addr: (nes: Nes) => Addr;
  instruction: (instruction: Instruction) => Nes;
  baseCycles: number;
  offsetCycles: number;
};

const instructionDictionary: Dictionary<number, InstructionDictionary> = {
  0x69: {
    addr: IMM,
    baseCycles: 2,
    offsetCycles: 0,
    instruction: ADC,
  },
  0x65: {
    addr: ZERO_PAGE,
    baseCycles: 3,
    offsetCycles: 0,
    instruction: ADC,
  },
  0x75: {
    addr: ZERO_PAGE_X,
    baseCycles: 4,
    offsetCycles: 0,
    instruction: ADC,
  },
  0x6d: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ABS,
    instruction: ADC,
  },
  0x7d: {
    baseCycles: 4,
    offsetCycles: 1,
    addr: ABSX,
    instruction: ADC,
  },
  0x79: {
    baseCycles: 4,
    offsetCycles: 1,
    addr: ABSY,
    instruction: ADC,
  },
  0x61: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: INDEXED_INDIRECT,
    instruction: ADC,
  },
  0x71: {
    baseCycles: 5,
    offsetCycles: 1,
    addr: INDIRECT_INDEXED,
    instruction: ADC,
  },
  0x29: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMM,
    instruction: AND,
  },
  0x25: {
    baseCycles: 3,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: AND,
  },
  0x35: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ZERO_PAGE_X,
    instruction: AND,
  },
  0x2d: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ABS,
    instruction: AND,
  },
  0x3d: {
    baseCycles: 4,
    offsetCycles: 1,
    addr: ABSX,
    instruction: AND,
  },
  0x39: {
    baseCycles: 4,
    offsetCycles: 1,
    addr: ABSY,
    instruction: AND,
  },
  0x21: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: INDEXED_INDIRECT,
    instruction: AND,
  },
  0x31: {
    baseCycles: 5,
    offsetCycles: 1,
    addr: INDIRECT_INDEXED,
    instruction: AND,
  },
  0x0a: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: ACC,
    instruction: ASL,
  },
  0x06: {
    baseCycles: 5,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: ASL,
  },
  0x16: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: ZERO_PAGE_X,
    instruction: ASL,
  },
  0x0e: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: ABS,
    instruction: ASL,
  },
  0x1e: {
    baseCycles: 7,
    offsetCycles: 0,
    addr: ABSX,
    instruction: ASL,
  },
  0x90: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: RELATIVE,
    instruction: BCC,
  },
  0xb0: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: RELATIVE,
    instruction: BCS,
  },
  0xf0: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: RELATIVE,
    instruction: BEQ,
  },
  0x24: {
    baseCycles: 3,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: BIT,
  },
  0x2c: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ABS,
    instruction: BIT,
  },
  0x30: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: RELATIVE,
    instruction: BMI,
  },
  0xd0: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: RELATIVE,
    instruction: BNE,
  },
  0x10: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: RELATIVE,
    instruction: BPL,
  },
  0x00: {
    baseCycles: 7,
    offsetCycles: 0,
    addr: IMP,
    instruction: BRK,
  },
  0x50: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: RELATIVE,
    instruction: BVC,
  },
  0x70: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: RELATIVE,
    instruction: BVS,
  },
  0x18: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: CLC,
  },
  0xd8: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: CLD,
  },
  0x58: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: CLI,
  },
  0xb8: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: CLV,
  },
  0xc9: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMM,
    instruction: CMP,
  },
  0xc5: {
    baseCycles: 3,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: CMP,
  },
  0xd5: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ZERO_PAGE_X,
    instruction: CMP,
  },
  0xcd: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ABS,
    instruction: CMP,
  },
  0xdd: {
    baseCycles: 4,
    offsetCycles: 1,
    addr: ABSX,
    instruction: CMP,
  },
  0xd9: {
    baseCycles: 4,
    offsetCycles: 1,
    addr: ABSY,
    instruction: CMP,
  },
  0xc1: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: INDEXED_INDIRECT,
    instruction: CMP,
  },
  0xd1: {
    baseCycles: 5,
    offsetCycles: 1,
    addr: INDIRECT_INDEXED,
    instruction: CMP,
  },
  0xe0: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMM,
    instruction: CPX,
  },
  0xe4: {
    baseCycles: 3,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: CPX,
  },
  0xec: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ABS,
    instruction: CPX,
  },
  0xc0: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMM,
    instruction: CPY,
  },
  0xc4: {
    baseCycles: 3,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: CPY,
  },
  0xcc: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ABS,
    instruction: CPY,
  },
  0xc6: {
    baseCycles: 5,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: DEC,
  },
  0xd6: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: ZERO_PAGE_X,
    instruction: DEC,
  },
  0xce: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: ABS_ADDR,
    instruction: DEC,
  },
  0xde: {
    baseCycles: 7,
    offsetCycles: 0,
    addr: ABSX_ADDR,
    instruction: DEC,
  },
  0xca: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: DEX,
  },
  0x88: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: DEY,
  },
  0x49: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMM,
    instruction: EOR,
  },
  0x45: {
    baseCycles: 3,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: EOR,
  },
  0x55: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ZERO_PAGE_X,
    instruction: EOR,
  },
  0x4d: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ABS,
    instruction: EOR,
  },
  0x5d: {
    baseCycles: 4,
    offsetCycles: 1,
    addr: ABSX,
    instruction: EOR,
  },
  0x59: {
    baseCycles: 4,
    offsetCycles: 1,
    addr: ABSY,
    instruction: EOR,
  },
  0x41: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: INDEXED_INDIRECT,
    instruction: EOR,
  },
  0x51: {
    baseCycles: 5,
    offsetCycles: 1,
    addr: INDIRECT_INDEXED,
    instruction: EOR,
  },
  0xe6: {
    baseCycles: 5,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: INC,
  },
  0xf6: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: ZERO_PAGE_X,
    instruction: INC,
  },
  0xee: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: ABS_ADDR,
    instruction: INC,
  },
  0xfe: {
    baseCycles: 7,
    offsetCycles: 0,
    addr: ABSX_ADDR,
    instruction: INC,
  },
  0xe8: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: INX,
  },
  0xc8: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: INY,
  },
  0x4c: {
    baseCycles: 3,
    offsetCycles: 0,
    addr: ABS,
    instruction: JMP,
  },
  0x6c: {
    baseCycles: 5,
    offsetCycles: 0,
    addr: INDIRECT,
    instruction: JMP,
  },
  0x20: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: ABS,
    instruction: JSR,
  },
  0xa9: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMM,
    instruction: LDA,
  },
  0xa5: {
    baseCycles: 3,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: LDA,
  },
  0xb5: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ZERO_PAGE_X,
    instruction: LDA,
  },
  0xad: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ABS,
    instruction: LDA,
  },
  0xbd: {
    baseCycles: 4,
    offsetCycles: 1,
    addr: ABSX,
    instruction: LDA,
  },
  0xb9: {
    baseCycles: 4,
    offsetCycles: 1,
    addr: ABSY,
    instruction: LDA,
  },
  0xa1: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: INDEXED_INDIRECT,
    instruction: LDA,
  },
  0xb1: {
    baseCycles: 5,
    offsetCycles: 1,
    addr: INDIRECT_INDEXED,
    instruction: LDA,
  },
  0xa2: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMM,
    instruction: LDX,
  },
  0xa6: {
    baseCycles: 3,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: LDX,
  },
  0xb6: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ZERO_PAGE_Y,
    instruction: LDX,
  },
  0xae: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ABS,
    instruction: LDX,
  },
  0xbe: {
    baseCycles: 4,
    offsetCycles: 1,
    addr: ABSY,
    instruction: LDX,
  },
  0xa0: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMM,
    instruction: LDY,
  },
  0xa4: {
    baseCycles: 3,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: LDY,
  },
  0xb4: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ZERO_PAGE_X,
    instruction: LDY,
  },
  0xac: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ABS,
    instruction: LDY,
  },
  0xbc: {
    baseCycles: 4,
    offsetCycles: 1,
    addr: ABSX,
    instruction: LDY,
  },
  0x4a: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: ACC,
    instruction: LSR,
  },
  0x46: {
    baseCycles: 5,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: LSR,
  },
  0x56: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: ZERO_PAGE_X,
    instruction: LSR,
  },
  0x4e: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: ABS,
    instruction: LSR,
  },
  0x5e: {
    baseCycles: 7,
    offsetCycles: 0,
    addr: ABSX,
    instruction: LSR,
  },
  0xea: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: NOP,
  },
  0x09: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMM,
    instruction: ORA,
  },
  0x05: {
    baseCycles: 3,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: ORA,
  },
  0x15: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ZERO_PAGE_X,
    instruction: ORA,
  },
  0x0d: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ABS,
    instruction: ORA,
  },
  0x1d: {
    baseCycles: 4,
    offsetCycles: 1,
    addr: ABSX,
    instruction: ORA,
  },
  0x19: {
    baseCycles: 4,
    offsetCycles: 1,
    addr: ABSY,
    instruction: ORA,
  },
  0x01: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: INDEXED_INDIRECT,
    instruction: ORA,
  },
  0x11: {
    baseCycles: 5,
    offsetCycles: 1,
    addr: INDIRECT_INDEXED,
    instruction: ORA,
  },
  0x48: {
    baseCycles: 3,
    offsetCycles: 0,
    addr: IMP,
    instruction: PHA,
  },
  0x08: {
    baseCycles: 3,
    offsetCycles: 0,
    addr: IMP,
    instruction: PHP,
  },
  0x68: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: IMP,
    instruction: PLA,
  },
  0x28: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: IMP,
    instruction: PLP,
  },
  0x2a: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: ACC,
    instruction: ROL,
  },
  0x26: {
    baseCycles: 5,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: ROL,
  },
  0x36: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: ZERO_PAGE_X,
    instruction: ROL,
  },
  0x2e: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: ABS,
    instruction: ROL,
  },
  0x3e: {
    baseCycles: 7,
    offsetCycles: 0,
    addr: ABSX,
    instruction: ROL,
  },
  0x6a: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: ACC,
    instruction: ROR,
  },
  0x66: {
    baseCycles: 5,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: ROR,
  },
  0x76: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: ZERO_PAGE_X,
    instruction: ROR,
  },
  0x6e: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: ABS,
    instruction: ROR,
  },
  0x7e: {
    baseCycles: 7,
    offsetCycles: 0,
    addr: ABSX,
    instruction: ROR,
  },
  0x40: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: IMP,
    instruction: RTI,
  },
  0x60: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: IMP,
    instruction: RTS,
  },
  0xe9: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMM,
    instruction: SBC,
  },
  0xe5: {
    baseCycles: 3,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: SBC,
  },
  0xf5: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ZERO_PAGE_X,
    instruction: SBC,
  },
  0xed: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ABS,
    instruction: SBC,
  },
  0xfd: {
    baseCycles: 4,
    offsetCycles: 1,
    addr: ABSX,
    instruction: SBC,
  },
  0xf9: {
    baseCycles: 4,
    offsetCycles: 1,
    addr: ABSY,
    instruction: SBC,
  },
  0xe1: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: INDEXED_INDIRECT,
    instruction: SBC,
  },
  0xf1: {
    baseCycles: 5,
    offsetCycles: 1,
    addr: INDIRECT_INDEXED,
    instruction: SBC,
  },
  0x38: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: SEC,
  },
  0xf8: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: SED,
  },
  0x78: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: SEI,
  },
  0x85: {
    baseCycles: 3,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: STA,
  },
  0x95: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ZERO_PAGE_X,
    instruction: STA,
  },
  0x8d: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ABS_ADDR,
    instruction: STA,
  },
  0x9d: {
    baseCycles: 5,
    offsetCycles: 0,
    addr: ABSX_ADDR,
    instruction: STA,
  },
  0x99: {
    baseCycles: 5,
    offsetCycles: 0,
    addr: ABSY_ADDR,
    instruction: STA,
  },
  0x81: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: INDEXED_INDIRECT_ADDR,
    instruction: STA,
  },
  0x91: {
    baseCycles: 6,
    offsetCycles: 0,
    addr: INDIRECT_INDEXED_ADDR,
    instruction: STA,
  },
  0x86: {
    baseCycles: 3,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: STX,
  },
  0x96: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ZERO_PAGE_Y,
    instruction: STX,
  },
  0x8e: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ABS_ADDR,
    instruction: STX,
  },
  0x84: {
    baseCycles: 3,
    offsetCycles: 0,
    addr: ZERO_PAGE,
    instruction: STY,
  },
  0x94: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ZERO_PAGE_X,
    instruction: STY,
  },
  0x8c: {
    baseCycles: 4,
    offsetCycles: 0,
    addr: ABS,
    instruction: STY,
  },
  0xaa: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: TAX,
  },
  0xa8: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: TAY,
  },
  0xba: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: TSX,
  },
  0x8a: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: TXA,
  },
  0x9a: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: TXS,
  },
  0x98: {
    baseCycles: 2,
    offsetCycles: 0,
    addr: IMP,
    instruction: TYA,
  },
};

export { instructionDictionary };
