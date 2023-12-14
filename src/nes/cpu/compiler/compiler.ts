import { Dictionary } from "@/nes/helper/dictionary";
import { instructionDictionary } from "../intructionDictionary/instructionDictionary";

type ADDR =
  | "IMP"
  | "ACC"
  | "IMM"
  | "ZERO_PAGE"
  | "ZERO_PAGE_X"
  | "ZERO_PAGE_Y"
  | "RELATIVE"
  | "ABSOLUTE"
  | "ABSOLUTE_X"
  | "ABSOLUTE_Y"
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

type Compiler = {
  comp: number[];
  instruction?: INSTRUCTION;
};

const instructionDictionaryOpcode: Dictionary<
  INSTRUCTION,
  Partial<Dictionary<ADDR, { opcode: number }>>
> = instructionDictionaryBuilder();

const addrDataDictionary: Dictionary<
  ADDR,
  { data: (value: string) => number[] }
> = {
  IMM: {
    data: (value) => [],
  },
};

function instructionDictionaryBuilder() {
  return Object.keys(instructionDictionary).reduce((acc, curr) => {
    const opcode = curr;
    const info = instructionDictionary[Number(curr)];
    const instruction = functionToInstruction(info.instruction);
    const addr = functionToAddr(info.addr);

    return {
      ...acc,
      [instruction]: {
        ...acc[instruction],
        [addr]: {
          opcode,
        },
      },
    };
  }, {} as Dictionary<INSTRUCTION, Partial<Dictionary<ADDR, { opcode: number }>>>);
}

const isImpliedInstruction = (instruction: INSTRUCTION): boolean => {
  throw new Error("not implemented");
};

const stringToInstruction = (instruction: string): INSTRUCTION => {
  throw new Error("not implemented");
};

const isACC = (addr: string) => addr === "A";
const isIMM = (addr: string) => /#[]/;

const stringToAddr = (instruction: string): ADDR => {
  throw new Error("not implemented");
};

function functionToInstruction(func: Function): INSTRUCTION {
  return stringToInstruction(func.name);
}

function functionToAddr(func: Function): ADDR {
  return stringToAddr(func.name);
}

const breakInstruction = (program: string): string[] =>
  program.split(/\s+/).filter((v) => v);

const fetchOpcode = (instruction: INSTRUCTION, addr: ADDR): number => {
  const addrDictionary = instructionDictionaryOpcode[instruction];
  const opcode = addrDictionary[addr];
  if (opcode == undefined) throw new Error("invalid opcode");
  return opcode.opcode;
};

const instructionFlow = (acc: Compiler, curr: string): Compiler => {
  const currInstruction = stringToInstruction(curr);
  if (isImpliedInstruction(currInstruction)) {
    const opcode = fetchOpcode(currInstruction, "IMP");
    return {
      ...acc,
      comp: [...acc.comp, opcode],
      instruction: undefined,
    };
  }
  return {
    ...acc,
    instruction: currInstruction,
  };
};

const opcodeFlow = (acc: Required<Compiler>, curr: string): Compiler => {
  const { instruction } = acc;
  const addr = stringToAddr(curr);
  const opcode = fetchOpcode(instruction, addr);
  const data = addrDataDictionary[addr].data(curr);

  return {
    ...acc,
    instruction: undefined,
    comp: [...acc.comp, opcode, ...data],
  };
};

const compile = (program: string): number[] => {
  const instruction = breakInstruction(program);

  instruction.reduce(
    (acc, curr) => {
      const { instruction } = acc;
      if (instruction == undefined) return instructionFlow(acc, curr);
      else return opcodeFlow({ ...acc, instruction }, curr);
    },
    { comp: [] } as Compiler
  );

  return [];
};

export { breakInstruction, compile };
