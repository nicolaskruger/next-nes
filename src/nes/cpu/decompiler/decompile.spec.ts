import { decompile } from "./decompile";

const allAddrProgram = `
CLC
LSR A
LDA #10
LDA $00
STY $10,X
LDX $10,Y
BNE *+4
JMP $1234
STA $3000,X
AND $4000,Y
JMP ($FFFC)
LDA ($40,X)
LDA ($40),Y
`.trim();

function joinAll(...opcode: number[][]) {
  return opcode.reduce((acc, curr) => [...acc, ...curr], []);
}

describe("decompile", () => {
  test("decompile", () => {
    const CLC = [0x18];
    const LSR_A = [0x4a];
    const LDA_IMM = [0xa9, 10];
    const LDA_$ = [0xa5, 0x00];
    const STY_$X = [0x94, 0x10];
    const LDX_$Y = [0xb6, 0x10];
    const BNE = [0xd0, 4];
    const JMP_$ = [0x4c, 0x34, 0x12];
    const STA_X = [0x9d, 0x00, 0x30];
    const AND_Y = [0x39, 0x00, 0x40];
    const JMP_IND = [0x6c, 0xfc, 0xff];
    const LDA_IND_X = [0xa1, 0x40];
    const LDA_IND_Y = [0xb1, 0x40];

    const program = joinAll(
      CLC,
      LSR_A,
      LDA_IMM,
      LDA_$,
      STY_$X,
      LDX_$Y,
      BNE,
      JMP_$,
      STA_X,
      AND_Y,
      JMP_IND,
      LDA_IND_X,
      LDA_IND_Y
    );

    expect(decompile(program)).toBe(allAddrProgram);
  });
});
