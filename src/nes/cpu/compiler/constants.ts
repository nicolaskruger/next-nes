import { Dictionary } from "@/nes/helper/dictionary";

type ADDR =
  | "IMP"
  | "ACC"
  | "IMM"
  | "ZERO_PAGE"
  | "ZERO_PAGE_X"
  | "ZERO_PAGE_Y"
  | "RELATIVE"
  | "ABS"
  | "ABSX"
  | "ABSY"
  | "INDIRECT"
  | "INDEXED_INDIRECT"
  | "INDIRECT_INDEXED";

type INSTRUCTION =
  | "ADC"
  | "AND"
  | "ASL"
  | "BCC"
  | "BCS"
  | "BEQ"
  | "BIT"
  | "BMI"
  | "BNE"
  | "BPL"
  | "BRK"
  | "BVC"
  | "BVS"
  | "CLC"
  | "CLD"
  | "CLI"
  | "CLV"
  | "CMP"
  | "CPX"
  | "CPY"
  | "DEC"
  | "DEX"
  | "DEY"
  | "EOR"
  | "INC"
  | "INX"
  | "INY"
  | "JMP"
  | "JSR"
  | "LDA"
  | "LDX"
  | "LDY"
  | "LSR"
  | "NOP"
  | "ORA"
  | "PHA"
  | "PHP"
  | "PLA"
  | "PLP"
  | "ROL"
  | "ROR"
  | "RTI"
  | "RTS"
  | "SBC"
  | "SEC"
  | "SED"
  | "SEI"
  | "STA"
  | "STX"
  | "STY"
  | "TAX"
  | "TAY"
  | "TSX"
  | "TXA"
  | "TXS"
  | "TYA";

const instructionDictionaryOpcode: Dictionary<
  INSTRUCTION,
  Partial<Dictionary<ADDR, { opcode: number }>>
> = {
  BRK: { IMP: { opcode: 0 } },
  ORA: {
    INDEXED_INDIRECT: { opcode: 1 },
    ZERO_PAGE: { opcode: 5 },
    IMM: { opcode: 9 },
    ABS: { opcode: 13 },
    INDIRECT_INDEXED: { opcode: 17 },
    ZERO_PAGE_X: { opcode: 21 },
    ABSY: { opcode: 25 },
    ABSX: { opcode: 29 },
  },
  ASL: {
    ZERO_PAGE: { opcode: 6 },
    ACC: { opcode: 10 },
    ABS: { opcode: 14 },
    ZERO_PAGE_X: { opcode: 22 },
    ABSX: { opcode: 30 },
  },
  PHP: { IMP: { opcode: 8 } },
  BPL: { RELATIVE: { opcode: 16 } },
  CLC: { IMP: { opcode: 24 } },
  JSR: { ABS: { opcode: 32 } },
  AND: {
    INDEXED_INDIRECT: { opcode: 33 },
    ZERO_PAGE: { opcode: 37 },
    IMM: { opcode: 41 },
    ABS: { opcode: 45 },
    INDIRECT_INDEXED: { opcode: 49 },
    ZERO_PAGE_X: { opcode: 53 },
    ABSY: { opcode: 57 },
    ABSX: { opcode: 61 },
  },
  BIT: { ZERO_PAGE: { opcode: 36 }, ABS: { opcode: 44 } },
  ROL: {
    ZERO_PAGE: { opcode: 38 },
    ACC: { opcode: 42 },
    ABS: { opcode: 46 },
    ZERO_PAGE_X: { opcode: 54 },
    ABSX: { opcode: 62 },
  },
  PLP: { IMP: { opcode: 40 } },
  BMI: { RELATIVE: { opcode: 48 } },
  SEC: { IMP: { opcode: 56 } },
  RTI: { IMP: { opcode: 64 } },
  EOR: {
    INDEXED_INDIRECT: { opcode: 65 },
    ZERO_PAGE: { opcode: 69 },
    IMM: { opcode: 73 },
    ABS: { opcode: 77 },
    INDIRECT_INDEXED: { opcode: 81 },
    ZERO_PAGE_X: { opcode: 85 },
    ABSY: { opcode: 89 },
    ABSX: { opcode: 93 },
  },
  LSR: {
    ZERO_PAGE: { opcode: 70 },
    ACC: { opcode: 74 },
    ABS: { opcode: 78 },
    ZERO_PAGE_X: { opcode: 86 },
    ABSX: { opcode: 94 },
  },
  PHA: { IMP: { opcode: 72 } },
  JMP: { ABS: { opcode: 76 }, INDIRECT: { opcode: 108 } },
  BVC: { RELATIVE: { opcode: 80 } },
  CLI: { IMP: { opcode: 88 } },
  RTS: { IMP: { opcode: 96 } },
  ADC: {
    INDEXED_INDIRECT: { opcode: 97 },
    ZERO_PAGE: { opcode: 101 },
    IMM: { opcode: 105 },
    ABS: { opcode: 109 },
    INDIRECT_INDEXED: { opcode: 113 },
    ZERO_PAGE_X: { opcode: 117 },
    ABSY: { opcode: 121 },
    ABSX: { opcode: 125 },
  },
  ROR: {
    ZERO_PAGE: { opcode: 102 },
    ACC: { opcode: 106 },
    ABS: { opcode: 110 },
    ZERO_PAGE_X: { opcode: 118 },
    ABSX: { opcode: 126 },
  },
  PLA: { IMP: { opcode: 104 } },
  BVS: { RELATIVE: { opcode: 112 } },
  SEI: { IMP: { opcode: 120 } },
  STA: {
    INDEXED_INDIRECT: { opcode: 129 },
    ZERO_PAGE: { opcode: 133 },
    ABS: { opcode: 141 },
    INDIRECT_INDEXED: { opcode: 145 },
    ZERO_PAGE_X: { opcode: 149 },
    ABSY: { opcode: 153 },
    ABSX: { opcode: 157 },
  },
  STY: {
    ZERO_PAGE: { opcode: 132 },
    ABS: { opcode: 140 },
    ZERO_PAGE_X: { opcode: 148 },
  },
  STX: {
    ZERO_PAGE: { opcode: 134 },
    ABS: { opcode: 142 },
    ZERO_PAGE_Y: { opcode: 150 },
  },
  DEY: { IMP: { opcode: 136 } },
  TXA: { IMP: { opcode: 138 } },
  BCC: { RELATIVE: { opcode: 144 } },
  TYA: { IMP: { opcode: 152 } },
  TXS: { IMP: { opcode: 154 } },
  LDY: {
    IMM: { opcode: 160 },
    ZERO_PAGE: { opcode: 164 },
    ABS: { opcode: 172 },
    ZERO_PAGE_X: { opcode: 180 },
    ABSX: { opcode: 188 },
  },
  LDA: {
    INDEXED_INDIRECT: { opcode: 161 },
    ZERO_PAGE: { opcode: 165 },
    IMM: { opcode: 169 },
    ABS: { opcode: 173 },
    INDIRECT_INDEXED: { opcode: 177 },
    ZERO_PAGE_X: { opcode: 181 },
    ABSY: { opcode: 185 },
    ABSX: { opcode: 189 },
  },
  LDX: {
    IMM: { opcode: 162 },
    ZERO_PAGE: { opcode: 166 },
    ABS: { opcode: 174 },
    ZERO_PAGE_Y: { opcode: 182 },
    ABSY: { opcode: 190 },
  },
  TAY: { IMP: { opcode: 168 } },
  TAX: { IMP: { opcode: 170 } },
  BCS: { RELATIVE: { opcode: 176 } },
  CLV: { IMP: { opcode: 184 } },
  TSX: { IMP: { opcode: 186 } },
  CPY: {
    IMM: { opcode: 192 },
    ZERO_PAGE: { opcode: 196 },
    ABS: { opcode: 204 },
  },
  CMP: {
    INDEXED_INDIRECT: { opcode: 193 },
    ZERO_PAGE: { opcode: 197 },
    IMM: { opcode: 201 },
    ABS: { opcode: 205 },
    INDIRECT_INDEXED: { opcode: 209 },
    ZERO_PAGE_X: { opcode: 213 },
    ABSY: { opcode: 217 },
    ABSX: { opcode: 221 },
  },
  DEC: {
    ZERO_PAGE: { opcode: 198 },
    ABS: { opcode: 206 },
    ZERO_PAGE_X: { opcode: 214 },
    ABSX: { opcode: 222 },
  },
  INY: { IMP: { opcode: 200 } },
  DEX: { IMP: { opcode: 202 } },
  BNE: { RELATIVE: { opcode: 208 } },
  CLD: { IMP: { opcode: 216 } },
  CPX: {
    IMM: { opcode: 224 },
    ZERO_PAGE: { opcode: 228 },
    ABS: { opcode: 236 },
  },
  SBC: {
    INDEXED_INDIRECT: { opcode: 225 },
    ZERO_PAGE: { opcode: 229 },
    IMM: { opcode: 233 },
    ABS: { opcode: 237 },
    INDIRECT_INDEXED: { opcode: 241 },
    ZERO_PAGE_X: { opcode: 245 },
    ABSY: { opcode: 249 },
    ABSX: { opcode: 253 },
  },
  INC: {
    ZERO_PAGE: { opcode: 230 },
    ABS: { opcode: 238 },
    ZERO_PAGE_X: { opcode: 246 },
    ABSX: { opcode: 254 },
  },
  INX: { IMP: { opcode: 232 } },
  NOP: { IMP: { opcode: 234 } },
  BEQ: { RELATIVE: { opcode: 240 } },
  SED: { IMP: { opcode: 248 } },
};

export { instructionDictionaryOpcode };
export type { INSTRUCTION, ADDR };
