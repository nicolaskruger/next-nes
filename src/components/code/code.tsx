import {
  Decompile,
  decompileNes,
  decompileNesSize,
  findCurrentInstruction,
} from "@/nes/cpu/decompiler/decompile";
import { dexToHexFourDigitsPrefix } from "@/nes/helper/converter";
import { Nes } from "@/nes/nes";

type CodeProps = {
  nes: Nes;
};

const size = 15;

export const Code = ({ nes }: CodeProps) => {
  const dec = decompileNesSize(nes, size);
  return (
    <ul>
      {dec.instruction.map(({ inst, index, opCode }, i) => {
        return (
          <li
            data-curr={0 === i}
            className="data-[curr=true]:text-red-500"
            key={i}
          >
            {dexToHexFourDigitsPrefix(index + 0x8000)}: {opCode} {inst}
          </li>
        );
      })}
      <li>...</li>
    </ul>
  );
};
