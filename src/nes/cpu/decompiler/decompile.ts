import { Dictionary } from "@/nes/helper/dictionary";
import { instructionDictionary } from "../intructionDictionary/instructionDictionary";
import { dexToHex } from "@/nes/helper/converter";
import { make8bitSigned } from "../instruction/instruction";

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
};

export const decompile = (program: number[]): string => {
  let code: string[] = [];

  for (let i = 0; i < program.length; ) {
    const { addr, instruction } = instructionDictionary[program[i]];
    const [size, func] = instSize[addr.name];

    code.push(
      `${instruction.name} ${func(
        ...program.slice(i + 1)
      ).toUpperCase()}`.trim()
    );
    i += size;
  }

  return code.join("\n");
};
