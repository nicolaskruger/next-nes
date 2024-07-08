import { repeat } from "@/nes/helper/repeat";
import { Nes } from "@/nes/nes";
import { getColors } from "@/nes/ppu/render/render";

type PalletsProps = {
  nes: Nes;
};

const getAllPalletsColors = (nes: Nes) => {
  return repeat(8)
    .map((_, i) => 0x3f00 + i * 4)
    .map((addr) => getColors(addr, nes)[0]);
};

export const Pallets = ({ nes }: PalletsProps) => {
  return (
    <div className="flex flex-col space-y-2">
      {getAllPalletsColors(nes).map((color, index) => (
        <div key={index} className="flex justify-between space-x-3">
          {color.map((color, index) => (
            <div
              style={{ backgroundColor: color }}
              className={`w-2 h-2 `}
              key={index}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
