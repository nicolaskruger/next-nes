import { NesView } from "../nes-view/nes-view";
import { FormEvent, useState } from "react";
import { initNesRunner, run } from "@/nes/cpu/runner/runner";
import { Dictionary } from "@/nes/helper/dictionary";
import { Container } from "../aux/container/container";

type InfoStates = "invisible" | "error" | "loading";

const Compiler = () => {
  const [nes, setNes] = useState(initNesRunner());
  const [program, setProgram] = useState("");
  const [info, setInfo] = useState<InfoStates>("invisible");
  const [error, setError] = useState("");

  const renderInfo = () => {
    const render: Dictionary<InfoStates, string> = {
      error: `can't compile this program, ${error}`,
      loading: "loading...",
      invisible: "...",
    };
    return render[info];
  };

  const onHandleSubmit = async (event: FormEvent) => {
    event.stopPropagation();
    event.preventDefault();
    try {
      setInfo("loading");
      const newNes = await run(program);
      setNes(newNes);
      setInfo("invisible");
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      setInfo("error");
    }
  };
  return (
    <main>
      <Container>
        <h1>Compiler</h1>
        <form action="submit" onSubmit={onHandleSubmit}>
          <textarea
            data-testid="text-area-compiler"
            name="program"
            id="program"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
          ></textarea>
          <button data-testid="button-compiler">run</button>
        </form>
        <p data-info={info} data-testid="compile-info" className="invisible">
          {renderInfo()}
        </p>
        <NesView nes={nes} />
      </Container>
    </main>
  );
};

export { Compiler };
