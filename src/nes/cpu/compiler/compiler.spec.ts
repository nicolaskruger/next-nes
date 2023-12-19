import {
  breakInstruction,
  compile,
  stringToAddr,
  stringToInstruction,
} from "./compiler";
import { ADDR } from "./constants";

const program = `
    LSR A
    ROR A
    LDA #10 
`;

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
`;

const invalidOpcodeProgram = `
    LSR $1234
`;

const errorInstructionNotFoundProgram = `
    DEL
`;

const errorAddrNotExistsProgram = `
    LSA NOT
`;

describe("compiler", () => {
  test("break instruction", () => {
    const instruction = breakInstruction(program);

    expect(instruction).toStrictEqual(["LSR", "A", "ROR", "A", "LDA", "#10"]);
  });

  test.skip("compile", () => {
    const comp = compile(allAddrProgram);

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

    expect(comp).toStrictEqual([
      ...CLC,
      ...LSR_A,
      ...LDA_IMM,
      ...LDA_$,
      ...STY_$X,
      ...LDX_$Y,
      ...BNE,
      ...JMP_$,
      ...STA_X,
      ...AND_Y,
      ...JMP_IND,
      ...LDA_IND_X,
      ...LDA_IND_Y,
    ]);
  });

  test.skip("instruction not found", () => {
    expect(() => compile(errorInstructionNotFoundProgram)).toThrow(
      "instruction DEL not exists"
    );
  });

  test.skip("addr not found", () => {
    expect(() => compile(errorAddrNotExistsProgram)).toThrow(
      "addr NOT is invalid"
    );
  });

  test("should transform string in to instruction key if is a valid instruction", () => {
    const instruction = stringToInstruction("BRK");
    expect(instruction).toBe("BRK");
  });

  test("should thrown an exception when transform string in to instruction key if is an invalid instruction", () => {
    expect(() => {
      stringToInstruction("BRK!!!");
    }).toThrow("invalid instruction BRK!!!");
  });

  test("should get all the types of addr correctly", () => {
    const addr = [
      "A",
      "#10",
      "$00",
      "$10,X",
      "$10,Y",
      "*+4",
      "$1234",
      "$3000,X",
      "$4000,Y",
      "($FFFC)",
      "($40,X)",
      "($40),Y",
    ];
    const result: ADDR[] = [
      "ACC",
      "IMM",
      "ZERO_PAGE",
      "ZERO_PAGE_X",
      "ZERO_PAGE_Y",
      "RELATIVE",
      "ABS",
      "ABSX",
      "ABSY",
      "INDIRECT",
      "INDEXED_INDIRECT",
      "INDIRECT_INDEXED",
    ];

    expect(addr.map(stringToAddr)).toStrictEqual(result);
  });
});
