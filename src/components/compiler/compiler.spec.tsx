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

  const fetchACC = () =>
    screen.findByTestId("register-ACC").then((v) => Number(v.textContent));

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
    const load3Program = `
                LDA #3
                STA $00
            `;
    await writeProgram(load3Program);
    console.log("write program");
    const compileInfo = await fetchCompilerInfo();
    console.log("compile info");
    expect(compileInfo.dataset.info).toBe("invisible");
    expect(await fetchBusData(0)).toBe(3);
  });

  test("multiply 3 by 10 program", async () => {
    const multiplyProgram = `
                LDA #3
                STA $00

                LDA #10
                STA $01

                LDA #0
                STA $02

                LDA #0
                STA $03

                LDA $03
                CLC
                ADC $00
                STA $03

                INC $02

                LDA $02
                SEC
                SBC $01

                BNE *-16
                LDA $03
            `;

    await writeProgram(multiplyProgram);
    expect(await fetchBusData(0)).toBe(3);
    expect(await fetchBusData(1)).toBe(10);
    expect(await fetchBusData(2)).toBe(10);
    expect(await fetchBusData(3)).toBe(30);
    expect(await fetchACC()).toBe(30);
  });
});
