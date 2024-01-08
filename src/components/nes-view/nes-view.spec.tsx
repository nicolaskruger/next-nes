import { render, screen } from "@testing-library/react";
import { NesView } from "./nes-view";
import { initNes } from "@/nes/nes";
import user from "@testing-library/user-event";
import "@testing-library/jest-dom";

describe("<NesView/>", () => {
  const queryBus = async (busId: string) => {
    return screen.queryByTestId<HTMLLIElement>(`bus-${busId}`);
  };

  const fetchAllButtonAndInput = () => {
    const prevButton = screen.getByTestId<HTMLButtonElement>("bus-button-prev");
    const nextButton = screen.getByTestId<HTMLButtonElement>("bus-button-next");

    const input = screen.getByTestId<HTMLInputElement>("input-page");

    const changeButton = screen.getByTestId<HTMLButtonElement>("button-change");

    return {
      prevButton,
      nextButton,
      input,
      changeButton,
    };
  };

  beforeEach(() => {
    render(<NesView nes={initNes()} />);
  });

  test("the prev button should be disable when on page 0x00", () => {
    const { prevButton } = fetchAllButtonAndInput();

    expect(prevButton.disabled).toBeTruthy();
  });

  test("the next button should be disable on page 0xff", async () => {
    const { nextButton, input, changeButton } = fetchAllButtonAndInput();

    expect(nextButton.disabled).toBe(false);

    await user.type(input, "ff");
    await user.click(changeButton);

    expect(nextButton.disabled).toBe(true);
  });

  test("should change page when click on next page", async () => {
    const { nextButton, input } = fetchAllButtonAndInput();

    expect(input.value).toBe(0);
    const buss0 = queryBus("0000");
    expect(buss0).toBeInTheDocument();
    await user.click(nextButton);

    expect(input.value).toBe(1);
    const bus0100 = queryBus("0100");
    expect(bus0100).toBeInTheDocument();
    expect(queryBus("0000")).not.toBeInTheDocument();
  });

  test("should change to previous page when click on prev page", async () => {
    const { prevButton, input, changeButton } = fetchAllButtonAndInput();

    await user.type(input, "0f");
    await user.click(changeButton);
    await user.click(prevButton);

    expect(input.value).toBe("0e");
    const bus0e00 = queryBus("0e00");
    expect(bus0e00).toBeInTheDocument();
  });

  test("should change the page when type on input", async () => {
    const { input, changeButton } = fetchAllButtonAndInput();

    await user.type(input, "01");

    await user.click(changeButton);

    expect(input.value).toBe("01");

    expect(queryBus("0100")).toBeInTheDocument();
  });
});
