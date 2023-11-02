import { readBus } from "@/nes/bus/bus";
import { Nes } from "@/nes/nes";

type Addr = {
  cross: boolean;
  data: number;
  nes: Nes;
};

const IMP = (nes: Nes): Addr => ({ nes, data: 0, cross: false });

const ACC = (nes: Nes): Addr => ({ nes, data: nes.cpu.ACC, cross: false });

const IMM = (nes: Nes): Addr => {
  const { cpu } = nes;
  const PC = cpu.PC + 1;
  const data = readBus(PC, nes);

  return {
    nes: { ...nes, cpu: { ...cpu, PC } },
    data,
    cross: false,
  };
};

export { IMP, ACC, IMM };
