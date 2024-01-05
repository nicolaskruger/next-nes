import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Compiler } from "./compiler";

const user = userEvent.setup();
describe("<Compiler/>", () => {
  beforeEach(() => {
    render(<Compiler />);
  });
  const fetchCompilerInfo = () => screen.findByTestId("compile-info");

  const writeProgram = async (program: string) => {
    const textArea = screen.getByTestId("text-area-compiler");

    const button = screen.getByTestId("button-compiler");

    await user.click(textArea);
    await user.paste(program);
    await user.click(button);
  };

  const fetchBusData = (index: number) =>
    screen.findByTestId(`bus-${index}`).then((v) => Number(v.textContent));

  test("can not compile this", async () => {
    const notCompileProgram = "no way no";
    await writeProgram(notCompileProgram);
    const compileInfo = await screen.findByTestId("compile-info");
    expect(compileInfo.dataset.info).toBe("error");
    expect(compileInfo.textContent).toBe(
      "can't compile this program, invalid instruction NO"
    );
  });

  test("load 3 to 0x0000", async () => {
    const multiplyProgram = `
                LDA #3
                STA $00
            `;
    await writeProgram(multiplyProgram);
    console.log("write program");
    const compileInfo = await fetchCompilerInfo();
    console.log("compile info");
    expect(compileInfo.dataset.info).toBe("invisible");
    expect(await fetchBusData(0)).toBe(3);
  });
});
