import { COLOR_PALLET, colorToHex } from "@/nes/ppu/color/color";

export default function CollorPallet() {
  return (
    <ul className="flex flex-wrap">
      {COLOR_PALLET.map((color, key) => (
        <li
          key={key}
          style={{ backgroundColor: colorToHex(key) }}
          className="w-20, h-20 text-red-50"
        >
          {key}
        </li>
      ))}
    </ul>
  );
}
