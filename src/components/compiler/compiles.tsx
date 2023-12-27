import { Nes } from "@/nes/nes";
import { NesView } from "../nes-view/nes-view";

const Compiler = () => {
  const nes: Nes = {} as Nes;
  return (
    <main>
      <h1>Compiler</h1>
      <form action="submit">
        <textarea
          data-testid="text-area-compiler"
          name="program"
          id="program"
        ></textarea>
        <button data-testid="button-compiler">run</button>
      </form>
      <p data-testid="compile-info" className="invisible">
        error !!!
      </p>
      <NesView nes={nes} />
    </main>
  );
};

export { Compiler };
