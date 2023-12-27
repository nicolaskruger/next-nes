import { compile } from "../compiler/compiler"
import { run } from "./runner"

jest.mock("../compiler/compiler")

const compileMocked = jest.mocked(compile)
const actualCompile = jest.requireActual("../compiler/compiler")["compile"]

describe("runner", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
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
    test("should PHA", async () => {
        const PHA = `
            LDA #65
            STA $00
            PHA
        `

        compileMocked.mockImplementation(actualCompile)
        const nes = await run(PHA)
        const { cpu, bus } = nes


        expect(cpu.ACC).toBe(65)
        expect(bus[0x01ff].data).toBe(65);
        expect(bus[0x01fe].data).toBe(0)

    })

    test("should load data", async () => {
        const PHA = `
            LDA #65
            STA $00
            PHA

            LDA #72
            STA $01
            PHA
            
            LDA #32
            STA $02
            PHA
            
            LDA #0
            STA $03
            
            LDA $00
            STA $04
        `

        compileMocked.mockImplementation(actualCompile)
        const nes = await run(PHA)
        const { cpu, bus } = nes


        expect(bus[0x00].data).toBe(65)
        expect(bus[0x01ff].data).toBe(65);

        expect(bus[0x01].data).toBe(72)
        expect(bus[0x01fe].data).toBe(72);

        expect(bus[0x02].data).toBe(32)
        expect(bus[0x01fd].data).toBe(32);

        expect(bus[0x03].data).toBe(0)
        expect(bus[0x01fc].data).toBe(0);

        expect(bus[0x04].data).toBe(65)
        expect(bus[0x01fb].data).toBe(0);


    })

    test("should verify witch number is the greatest", async () => {
        const theGreatestProgram = `
                LDA #65
                STA $00
                PHA

                LDA #72
                STA $01
                PHA

                LDA #32
                STA $02
                PHA

                LDA #0
                STA $03

                LDA $00
                STA $04

                INC $03
                PLA
                CMP $04
                BCC *+2
                STA $04
                LDA $03
                CMP #3
                BNE *-15
                LDA $04
            `
        compileMocked.mockImplementation(actualCompile)
        const nes = await run(theGreatestProgram)

        const { cpu, bus } = nes

        expect(bus[0x0000].data).toBe(65)
        expect(bus[0x0001].data).toBe(72)
        expect(bus[0x0002].data).toBe(32)

        expect(bus[0x01ff].data).toBe(65)
        expect(bus[0x01fe].data).toBe(72)
        expect(bus[0x01fd].data).toBe(32)

        expect(bus[0x0003].data).toBe(3)
        expect(bus[0x0004].data).toBe(72)
        expect(cpu.ACC).toBe(72)
    })
})