import { render, screen, fireEvent } from "@testing-library/react";
import { ControlPlayground } from "./control-playground";

function check(e: HTMLElement, value: boolean) {
  const regex = value ? /true/gi : /false/gi;
  expect(regex.test(e.innerHTML)).toBeTruthy();
}

function checkAll(es: HTMLElement[], values: boolean[]) {
  es.forEach((e, i) => {
    check(e, values[i]);
  });
}
describe("control playground", () => {
  it.skip("should change values ons keydown and keyup", () => {
    render(<ControlPlayground />);
    const main = screen.getByTestId("main");
    const a = screen.getByTestId("a");
    const b = screen.getByTestId("b");
    const up = screen.getByTestId("up");
    const left = screen.getByTestId("left");
    const right = screen.getByTestId("right");
    const down = screen.getByTestId("down");
    const start = screen.getByTestId("start");
    const select = screen.getByTestId("select");
    const control = [a, b, up, left, right, down, start, select];
    const result = "_"
      .repeat(8)
      .split("")
      .map((_) => false);
    const keys = ["j", "k", "w", "a", "d", "s", "n", "m"];
    control.forEach((c) => check(c, false));

    keys.forEach((key, i) => {
      result[i] = true;
      fireEvent.keyDown(main, {
        key,
      });
      checkAll(control, result);
    });

    keys.forEach((key, i) => {
      result[i] = false;
      fireEvent.keyUp(main, {
        key,
      });
      checkAll(control, result);
    });
  });
});
