import { Decompile } from "@/nes/cpu/decompiler/decompile";
import { dexToHexFourDigitsPrefix } from "@/nes/helper/converter";

type CodeProps = {
  dec: Decompile;
  currIns: number;
};

export const Code = ({ dec, currIns }: CodeProps) => {
  return (
    <ul>
      {dec.instruction.map(({ inst }, i) => {
        return (
          <li
            data-curr={currIns === i}
            className="data-[curr=true]:text-red-500"
            key={i}
          >
            {dexToHexFourDigitsPrefix(i)}: {inst}
          </li>
        );
      })}
    </ul>
  );
};
