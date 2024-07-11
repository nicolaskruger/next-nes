import { initDemoRom, tickUntilEndDemoRom } from "@/nes/debug/rom-debug";
import { render, screen } from "@testing-library/react";
import { Pallets } from "./pallets";
import { repeat } from "@/nes/helper/repeat";

const PALLET = [
  ["#000000", "#757575", "#757575", "#757575"],
  ["#000000", "#757575", "#757575", "#757575"],
  ["#000000", "#757575", "#757575", "#757575"],
  ["#000000", "#757575", "#757575", "#757575"],
  ["#000000", "#ffffff", "#757575", "#757575"],
  ["#000000", "#757575", "#757575", "#757575"],
  ["#000000", "#757575", "#757575", "#757575"],
];

const getPallet = (): string[][] => {
  return repeat(7).map((_, j) =>
    repeat(4).map((_, i) => {
      const pallet = screen.getByTestId<HTMLDivElement>(`pallet-${i}-${j}`);
      return pallet.attributes.getNamedItem("data-color")!.value;
    })
  );
};

describe("<Pallet/>", () => {
  test("should render tiles", async () => {
    let nes = await initDemoRom();
    nes = tickUntilEndDemoRom(nes);
    render(<Pallets nes={nes} />);
    expect(getPallet()).toStrictEqual(PALLET);
  });
});
