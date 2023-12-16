import { Dictionary } from "@/nes/helper/dictionary";
import {
  ADDR,
  INSTRUCTION,
  instructionDictionaryOpcode,
  instructionList,
} from "./constants";

type Compiler = {
  comp: number[];
  instruction?: INSTRUCTION;
};

const addrDataDictionary: Dictionary<
  ADDR,
  { data: (value: string) => number[] }
> = {
  IMM: {
    data: (value) => [],
  },
};
const isImpliedInstruction = (instruction: INSTRUCTION): boolean => {
  throw new Error("not implemented");
};

export const stringToInstruction = (instruction: string): INSTRUCTION => {
  if (instruction && instructionList.includes(instruction as INSTRUCTION))
    return instruction as INSTRUCTION;
  throw new Error(`invalid instruction ${instruction}`);
};

const isACC = (addr: string) => addr === "A";
const isIMM = (addr: string) => /#\d{1,3}/g.test(addr);

export const stringToAddr = (instruction: string): ADDR => {
  throw new Error("not implemented");
};

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
