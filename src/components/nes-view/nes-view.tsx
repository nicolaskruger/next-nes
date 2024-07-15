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

const ChangePageButton = (
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) => {
  return (
    <button
      className="bg-slate-200 text-slate-950 px-4 rounded-full active:bg-slate-300  cursor-pointer"
      {...props}
    >
      {props.children}
    </button>
  );
};

const SpanSlate50 = (props: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className="text-slate-50" {...props}>
      {props.children}
    </span>
  );
};

const NesView = ({ nes }: NesViewProps) => {
  const { cpu, bus } = nes;

  const [page, setPage] = useState(0);

  const toBusId = (id: number) =>
    `bus-${dexToHexFourDigitsNoPrefix((page << 8) | id)}`;

  const busId = (id: number) => dexToHexFourDigitsPrefix((page << 8) | id);

  const [inputPage, setInputPage] = useState(dexToHexTwoDigitsNoPrefix(page));

  const changePage = (page: number) => {
    setPage(page);
    setInputPage(dexToHexTwoDigitsNoPrefix(page));
    setError(false);
  };

  const [error, setError] = useState(false);

  const startOfPage = () => page << 8;
  const endOfPage = () => (page << 8) | 0xff;

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

  const cpuArray = Object.keys(cpu)
    .filter((key) => key !== "interrupt")
    .map((key) => ({
      key,
      data: cpu[key as keyof Omit<Cpu, "interrupt">],
    }));

  return (
    <div>
      <h1 className="text-2xl text-slate-50 mb-3">NES</h1>
      <h2 className="text-amber-500 text-xl mb-3">Registers</h2>
      <ul className="flex gap-5 break-words flex-wrap">
        {cpuArray.map(({ key, data }) => (
          <li key={key} className="flex flex-col items-start">
            <h3 className="text-blue-400">{key}</h3>
            <p className="text-slate-50" data-testid={`register-${key}`}>
              {dexToHexFourDigitsPrefix(data)}
            </p>
          </li>
        ))}
      </ul>
      <h2 className="text-pink-500 text-xl mt-3 mb-3">Bus</h2>
      <div className="flex space-x-2 mb-2">
        <ChangePageButton
          onClick={() => changePage(page - 1)}
          disabled={page === 0}
          data-testid="bus-button-prev"
        >
          prev
        </ChangePageButton>
        <p>
          <SpanSlate50>{startPageHex()}</SpanSlate50> -{" "}
          <SpanSlate50>{endPageHex()}</SpanSlate50> page{" "}
          <SpanSlate50>0x</SpanSlate50>
          <input
            className="bg-slate-600 w-5 text-slate-50"
            type="text"
            data-testid="input-page"
            onChange={(e) => setInputPage(e.target.value)}
            value={inputPage}
          />{" "}
          of <SpanSlate50>0xff</SpanSlate50>{" "}
          <button
            className="text-purple-500"
            onClick={handleClickChangeButton}
            data-testid="button-change"
          >
            change
          </button>
        </p>
        <ChangePageButton
          onClick={() => changePage(page + 1)}
          disabled={page === 0xff}
          data-testid="bus-button-next"
        >
          next
        </ChangePageButton>
      </div>
      <p
        data-testid="error-nes-view"
        className="invisible data-[error=true]:visible mb-1 text-red-500"
        data-error={error}
      >
        invalid number of page
      </p>
      <ul className="flex flex-wrap gap-2 pb-4">
        {bus.slice(0, 0x0100).map(({ data }, index) => (
          <li key={toBusId(index)}>
            <h3 className="text-slate-50">{busId(index)}</h3>
            <p data-testid={toBusId(index)}>{dexToHexFourDigitsPrefix(data)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export { NesView };
