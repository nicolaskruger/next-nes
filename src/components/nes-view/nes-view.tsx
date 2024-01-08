import { Cpu } from "@/nes/cpu/cpu";
import { Nes } from "@/nes/nes";

type NesViewProps = {
  nes: Nes;
};

const NesView = ({ nes }: NesViewProps) => {
  const { cpu, bus } = nes;

  const cpuArray = Object.keys(cpu).map((key) => ({
    key,
    data: cpu[key as keyof Cpu],
  }));

  return (
    <div>
      <h2>Registers</h2>
      <ul>
        {cpuArray.map(({ key, data }) => (
          <li key={key}>
            <h3>{key}</h3>
            <p data-testid={`register-${key}`}>{data}</p>
          </li>
        ))}
      </ul>
      <h2>Bus</h2>
      <div>
        <button data-testid="bus-button-prev">prev</button>
        <p>
          0x0000 - 0x00ff page{" "}
          <input type="text" data-testid="input-page" value={0} /> of 0xff{" "}
          <button data-testid="button-change">change</button>
        </p>
        <p data-error="invisible">invalid number of page</p>
        <button data-testid="bus-button-next">next</button>
      </div>
      <ul>
        {bus.slice(0, 0x00ff).map(({ data }, index) => (
          <li key={`bus-${index}`}>
            <h3>{index}</h3>
            <p data-testid={`bus-${index}`}>{data}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export { NesView };
