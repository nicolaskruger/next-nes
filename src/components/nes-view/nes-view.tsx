import { Cpu } from "@/nes/cpu/cpu";
import {
  dexToHexFourDigitsNoPrefix,
  dexToHexFourDigitsPrefix,
  dexToHexTwoDigitsNoPrefix,
  hexToDex,
} from "@/nes/helper/converter";
import { Nes } from "@/nes/nes";
import { useState } from "react";

type NesViewProps = {
  nes: Nes;
};

const NesView = ({ nes }: NesViewProps) => {
  const { cpu, bus } = nes;

  const [page, setPage] = useState(0);

  const toBusId = (id: number) =>
    `bus-${dexToHexFourDigitsNoPrefix((page << 8) | id)}`;

  const [inputPage, setInputPage] = useState(dexToHexTwoDigitsNoPrefix(page));

  const changePage = (page: number) => {
    setPage(page);
    setInputPage(dexToHexTwoDigitsNoPrefix(page));
  };

  const [error, setError] = useState(false);

  const startOfPage = () => page * 0xff;
  const endOfPage = () => (page + 1) * 0xff;

  const startPageHex = () => dexToHexFourDigitsPrefix(startOfPage());
  const endPageHex = () => dexToHexFourDigitsPrefix(endOfPage());

  const handleClickChangeButton = () => {
    const nextPage = hexToDex(inputPage);
    if (isNaN(nextPage)) {
      setError(true);
    } else {
      setError(false);
      changePage(nextPage);
    }
  };

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
        <button
          onClick={() => changePage(page - 1)}
          disabled={page === 0}
          data-testid="bus-button-prev"
        >
          prev
        </button>
        <p>
          {startPageHex()} - {endPageHex()} page 0x
          <input
            type="text"
            data-testid="input-page"
            onChange={(e) => setInputPage(e.target.value)}
            value={inputPage}
          />{" "}
          of 0xff{" "}
          <button onClick={handleClickChangeButton} data-testid="button-change">
            change
          </button>
        </p>
        <p data-testid="error-nes-view" data-error={error}>
          invalid number of page
        </p>
        <button
          onClick={() => changePage(page + 1)}
          disabled={page === 0xff}
          data-testid="bus-button-next"
        >
          next
        </button>
      </div>
      <ul>
        {bus.slice(0, 0x00ff).map(({ data }, index) => (
          <li key={toBusId(index)}>
            <h3>{index}</h3>
            <p data-testid={toBusId(index)}>{data}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export { NesView };
