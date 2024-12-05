import { createMushroomWord } from "./debug/background-creator";
import { tick } from "./tick";

let nes = createMushroomWord();

describe("tick", () => {
  beforeEach(() => {
    nes = createMushroomWord();
  });

  test.skip("tick", () => {
    const result = tick(nes);
    // expect(result.delayTime > 0).toBeTruthy();
    console.log(result);
  });
});
