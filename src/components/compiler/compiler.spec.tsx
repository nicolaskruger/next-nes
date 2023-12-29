import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Compiler } from "./compiles";

const user = userEvent.setup();
describe("<Compiler/>", () => {
  beforeEach(() => {
    render(<Compiler />);
  });
  const fetchCompilerInfo = () => screen.findByTestId("compile-info");

  const writeProgram = async (program: string) => {
    const textArea = await screen.findByTestId("text-area-compiler");

    const button = await screen.findByTestId("button-compiler");

    await user.click(textArea);
    await user.keyboard(program);
    await user.click(button);
  };

  const fetchBusData = (index: number) => screen.findByTestId(`bus-${index}`);

  const fetchACC = () => screen.findByTestId("register-ACC");

  test("can't compile this", async () => {
    const notCompileProgram = "no way no";
    await writeProgram(notCompileProgram);
    const compileInfo = await screen.findByTestId("compile-info");
    expect(compileInfo.dataset.info).toBe("error");
    console.log(compileInfo);
    expect(compileInfo.textContent).toBe(
      "can't compile this program, invalid instruction NO"
    );
  }, 60000);

  test.skip("compile program", async () => {
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
  }, 60000);
});
