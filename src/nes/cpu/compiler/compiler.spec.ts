import { breakInstruction } from "./compiler";

const program = `
    LSR A
    ROR A
    LDA #10 
`;

describe("compiler", () => {
  test("break instruction", () => {
    const instruction = breakInstruction(program);

    expect(instruction).toStrictEqual(["LSR", "A", "ROR", "A", "LDA", "#10"]);
  });
});
