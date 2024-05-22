import { Dictionary } from "@/nes/helper/dictionary";
import { instructionDictionary } from "../intructionDictionary/instructionDictionary";
import { dexToHex, dexToHexFourDigitsPrefix } from "@/nes/helper/converter";
import { make8bitSigned } from "../instruction/instruction";
import { Nes, initNes } from "@/nes/nes";
import { getPC } from "../cpu";

const instSize: Dictionary<string, [number, (...data: number[]) => string]> = {
  IMP: [1, () => ""],
  ACC: [1, () => "A"],
  IMM: [2, (a) => `#${a}`],
  ZERO_PAGE: [2, (a) => `$${dexToHex(a, 2, false)}`],
  ZERO_PAGE_X: [2, (a) => `$${dexToHex(a, 2, false)},X`],
  ZERO_PAGE_Y: [2, (a) => `$${dexToHex(a, 2, false)},Y`],
  RELATIVE: [
    2,
    (a) => {
      const data = make8bitSigned(a);
      const sine = data >= 0 ? "+" : "";
      return `*${sine}${data}`;
    },
  ],
  ABS: [
    3,
    (a, b) => {
      const data = (b << 8) | a;
      return `$${dexToHex(data, 4, false)}`;
    },
  ],
  ABSX: [
    3,
    (a, b) => {
      const data = (b << 8) | a;
      return `$${dexToHex(data, 4, false)},X`;
    },
  ],
  ABSY: [
    3,
    (a, b) => {
      const data = (b << 8) | a;
      return `$${dexToHex(data, 4, false)},Y`;
    },
  ],
  INDIRECT: [
    3,
    (a, b) => {
      const data = (b << 8) | a;
      return `($${dexToHex(data, 4, false)})`;
    },
  ],
  INDEXED_INDIRECT: [2, (a) => `($${dexToHex(a, 2, false)},X)`],
  INDIRECT_INDEXED: [2, (a) => `($${dexToHex(a, 2, false)}),Y`],
  XXX: [1, (a) => ``],
};

export type InstData = {
  inst: string;
  opCode: string;
  index: number;
};

export type Decompile = {
  program: string;
  instruction: InstData[];
};

export const decompile = (program: number[]): Decompile => {
  let code: string[] = [];
  const dec: InstData[] = [];

  for (let i = 0; i < program.length; ) {
    const { addr, instruction } = instructionDictionary[program[i]] || {
      addr: function XXX(v) {},
      instruction: function XXX(ins) {
        return initNes();
      },
    };
    const [size, func] = instSize[addr.name];

    const inst = `${instruction.name} ${func(
      ...program.slice(i + 1)
    ).toUpperCase()}`.trim();

    dec.push({
      index: i,
      opCode: dexToHex(program[i], 2, true),
      inst,
    });

    code.push(inst);
    i += size;
  }

  return { instruction: dec, program: code.join("\n") };
};

export const decompileNes = (nes: Nes): Decompile =>
  decompile(nes.bus.map((v) => v.data).slice(0x8000));

export const findCurrentInstruction = (
  nes: Nes,
  { instruction }: Decompile
) => {
  const pc = getPC(nes);
  return instruction.findIndex(({ index }) => index === pc - 0x8000);
};

export const decAllBytes = (nes: Nes): string[] => {
  const program = nes.bus.map((v) => v.data).slice(0x8000);
  return program.map(
    (p, i) =>
      `${dexToHexFourDigitsPrefix(i + 0x8000)} - ${dexToHexFourDigitsPrefix(p)}`
  );
};

export const splitInstructions = (program: string) => program.split("\n");
