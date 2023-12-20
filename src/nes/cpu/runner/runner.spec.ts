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
        }).rejects.toThrow("to log program max 32768 bytes")
    })
})