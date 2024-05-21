import { Decompile } from "@/nes/cpu/decompiler/decompile";
import { dexToHexFourDigitsPrefix } from "@/nes/helper/converter";

type CodeProps = {
  dec: Decompile;
  currIns: number;
};

// eslint-disable-next-line react/display-name
export const Code = ({ dec, currIns }: CodeProps) => {
  return (
    <ul>
      {dec.instruction
        .slice(currIns, currIns + 15)
        .map(({ inst, index }, i) => {
          return (
            <li
              data-curr={0 === i}
              className="data-[curr=true]:text-red-500"
              key={i}
            >
              {dexToHexFourDigitsPrefix(index + 0x8000)}: {inst}
            </li>
          );
        })}
      <li>...</li>
    </ul>
  );
};
