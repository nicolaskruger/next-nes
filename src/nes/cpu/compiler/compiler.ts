const breakInstruction = (program: string): string[] =>
  program.split(/\s+/).filter((v) => v);

export { breakInstruction };
