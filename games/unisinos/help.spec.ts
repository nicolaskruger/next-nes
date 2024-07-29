describe("some calc", () => {
  test("test", () => {
    console.log((0x1c + 12).toString(16));
  });

  test("rescenter", () => {
    const result = [0x6c, 0x76, 0x80, 0x8a, 0x94, 0x9e, 0xa8, 0xb2]
      .map((v) => v - 15)
      .map((v) => v.toString(16));
    console.log(result);
  });
});
