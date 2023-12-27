import { render, screen, waitFor } from "@testing-library/react";
import user from "@testing-library/user-event";
import { Compiler } from "./compiles";
describe("<Compiler/>", () => {
  const fetchCompilerInfo = () => screen.findByTestId("compile-info");

  const writeProgram = async (program: string) => {
    const textArea = await screen.findByTestId("text-area-compiler");

    const button = await screen.findByTestId("button compiler");

    await user.type(textArea, program);

    await user.click(button);
  };

  const fetchBusData = (index: number) => screen.findByTestId(`bus-${index}`);

  const fetchACC = () => screen.findByTestId("register-ACC");

  beforeEach(() => {
    render(<Compiler />);
  });

  test("can't compile this", async () => {
    const notCompileProgram = "no way no";
    await writeProgram(notCompileProgram);
    await waitFor(async () => {
      const compileInfo = await fetchCompilerInfo();
      expect(compileInfo.dataset.info).toBe("error");
      expect(compileInfo.innerText).toBe(
        "cant compile this program, no is an invalid opcode"
      );
    });
  });

  test("compile the multiply by 3*10 program", async () => {
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
    await waitFor(async () => {
      const compileInfo = await fetchCompilerInfo();
      expect(compileInfo.dataset.info).toBe("invisible");

      expect(await fetchBusData(0)).toBe(3);
      expect(await fetchBusData(1)).toBe(10);
      expect(await fetchBusData(2)).toBe(10);
      expect(await fetchBusData(3)).toBe(30);
      expect(await fetchACC()).toBe(30);
    });
  });
});
