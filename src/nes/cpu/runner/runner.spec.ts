import { compile } from "../compiler/compiler"
import { run } from "./runner"

jest.mock("../compiler/compiler")

const compileMocked = jest.mocked(compile)
const actualCompile = jest.requireActual("../compiler/compiler")["compile"]

describe("runner", () => {
    test("should not run if the program was to long, more then 32768 bytes", async () => {
        const toLongProgram = "_".repeat(0xffff).split("").map(v => 1);
        compileMocked.mockReturnValue(toLongProgram)
        expect(async () => {
            await run("")
        }).rejects.toThrow("to long program max 32768 bytes")
    })
    test("should multiply 3 by 10 and the result should be 30",
        async () => {
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
            `

            compileMocked.mockImplementation(actualCompile)

            const nes = await run(multiplyProgram)

            const { bus, cpu } = nes

            expect(bus[0].data).toBe(3);
            expect(bus[1].data).toBe(10);
            expect(bus[2].data).toBe(10);
            expect(bus[3].data).toBe(30);
            expect(cpu.ACC).toBe(30);

        })
})