import { compile } from "../compiler/compiler"

const run = async (program: string) => {
    const comp = compile(program)
    if (comp.length > 32768)
        throw new Error("to log program max 32768 bytes")
}

export {
    run
}