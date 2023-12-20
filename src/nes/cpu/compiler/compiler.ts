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

const isACC = (addr: string) => addr === "A";
const isIMM = (addr: string) => /^#\d{1,3}$/g.test(addr);
const isZERO_PAGE = (addr: string) => /^\$[0-9A-F]{2}$/.test(addr);
const isZERO_PAGE_X = (addr: string) => /^\$[0-9A-F]{2},X$/.test(addr);
const isZERO_PAGE_Y = (addr: string) => /^\$[0-9A-F]{2},Y$/.test(addr);
const isRELATIVE = (addr: string) => /^\*[+-]\d{1,3}$/.test(addr);
const isABS = (addr: string) => /^\$[0-9A-F]{4}$/.test(addr);
const isABSX = (addr: string) => /^\$[0-9A-F]{4},X$/.test(addr);
const isABSY = (addr: string) => /^\$[0-9A-F]{4},Y$/.test(addr);
const isINDIRECT = (addr: string) => /^\(\$[0-9A-F]{4}\)$/.test(addr);
const isINDEXED_INDIRECT = (addr: string) => /^\(\$[0-9A-F]{2},X\)$/g.test(addr);
const isINDIRECT_INDEXED = (addr: string) => /^\(\$[0-9A-F]{2}\),Y$/.test(addr);

type StringAddrType = {
  addr: ADDR,
  verify: (addr: string) => boolean;
}

const stringToAddrArray: StringAddrType[] = [
  {
    addr: "ACC",
    verify: isACC
  },
  {
    addr: "IMM",
    verify: isIMM
  },
  {
    addr: "ZERO_PAGE",
    verify: isZERO_PAGE
  },
  {
    addr: "ZERO_PAGE_X",
    verify: isZERO_PAGE_X
  },
  {
    addr: "ZERO_PAGE_Y",
    verify: isZERO_PAGE_Y
  },
  {
    addr: "ABS",
    verify: isABS,
  },
  {
    addr: "ABSX",
    verify: isABSX
  },
  {
    addr: "ABSY",
    verify: isABSY
  },
  {
    addr: "INDIRECT",
    verify: isINDIRECT
  },
  {
    addr: "INDIRECT_INDEXED",
    verify: isINDIRECT_INDEXED
  },
  {
    addr: "INDEXED_INDIRECT",
    verify: isINDEXED_INDIRECT
  },
  {
    addr: "RELATIVE",
    verify: isRELATIVE
  }
]

const findGroup = (regex: RegExp, value: string) => {
  return value.matchAll(regex).next().value[1] as string
}

const parseHex = (value: string) => {
  return Number(`0x${value}`)
}

const parseIntToArray = (value: string) => {
  return [parseInt(value)]
}

const parseHexToArray = (value: string) => [parseHex(value)]

const parseHexTwoBytesToArray = (value: string) => {
  const hex = parseHex(value);
  const low = hex & 0xff
  const high = hex >> 8
  return [low, high]
}

const toOpcode = (regex: RegExp, parse: (value: string) => number[]) =>
  (value: string) => {
    const group = findGroup(regex, value)
    return parse(group)
  }

export const immediateToOpcode = toOpcode(/^#(\d{1,3})$/g, parseIntToArray)

export const zeroPageToOpcode = toOpcode(/^\$([0-9A-F]{2})$/g, parseHexToArray)

export const zeroPageXToOpcode = toOpcode(/^\$([0-9A-F]{2}),X$/g, parseHexToArray)

export const zeroPageYToOpcode = toOpcode(/^\$([0-9A-F]{2}),Y$/g, parseHexToArray)

export const relativeToOpcode = toOpcode(/^\*([+-]\d{1,3})$/g,
  (value) => [Number(value) & 0xff])

const toOpcodeAbs = (regex: RegExp) => toOpcode(regex, parseHexTwoBytesToArray)

export const absoluteToOpcode = toOpcodeAbs(/^\$([0-9A-F]{4})$/g)

export const absoluteXToOpcode = toOpcodeAbs(/^\$([0-9A-F]{4}),X$/g)

export const absoluteYToOpcode = toOpcodeAbs(/^\$([0-9A-F]{4}),Y$/g)

export const indirectToOpcode = () => { throw new Error("not implemented") }

export const indirectIndexedToOpcode = () => { throw new Error("not implemented") }

export const indexedIndirectToOpcode = () => { throw new Error("not implemented") }

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

export const stringToAddr = (instruction: string): ADDR => {
  const addr = stringToAddrArray.find(addr => addr.verify(instruction))
  if (addr) return addr.addr;
  throw new Error("this is not a valid addr");
};

const breakInstruction = (program: string): string[] =>
  program.toUpperCase().split(/\s+/).filter((v) => v);

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