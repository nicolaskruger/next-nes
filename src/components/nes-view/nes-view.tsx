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
      <ul>
        {bus.map(({ data }, index) => (
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
