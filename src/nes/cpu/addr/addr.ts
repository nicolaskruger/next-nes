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

const ZERO_PAGE = (nes: Nes): Addr => {
  const { cpu } = nes;
  const PC = cpu.PC + 1;

  const zeroPageAddr = readBus(PC, nes);

  const data = readBus(zeroPageAddr, nes);

  return {
    nes: { ...nes, cpu: { ...cpu, PC } },
    data,
    cross: false,
  };
};

const ZERO_PAGE_X = (nes: Nes): Addr => {
  const { cpu } = nes;

  const PC = cpu.PC + 1;

  let cross = false;
  let addr = readBus(PC, nes) + cpu.X;

  if (addr > 0xff) {
    addr = 0xff & addr;
    cross = true;
  }

  const data = readBus(addr, nes);

  return {
    cross,
    data,
    nes: { ...nes, cpu: { ...cpu, PC } },
  };
};

const ZERO_PAGE_Y = (nes: Nes): Addr => {
  const { cpu } = nes;

  const PC = cpu.PC + 1;

  let cross = false;
  let addr = readBus(PC, nes) + cpu.Y;

  if (addr > 0xff) {
    addr = 0xff & addr;
    cross = true;
  }

  const data = readBus(addr, nes);

  return {
    cross,
    data,
    nes: { ...nes, cpu: { ...cpu, PC } },
  };
};

const RELATIVE = (nes: Nes): Addr => {
  const { cpu } = nes;

  const PC = cpu.PC + 1;

  let data = readBus(PC, nes);

  if (((data >> 7) & 1) == 1) data = (-1 << 8) | data;

  return {
    cross: false,
    data,
    nes: { ...nes, cpu: { ...cpu, PC } },
  };
};

const ABS = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC + 1;

  const low = readBus(PC++, nes);
  const high = readBus(PC, nes);

  const addr = (high << 8) | low;

  const data = readBus(addr, nes);

  return {
    cross: false,
    data,
    nes: { ...nes, cpu: { ...cpu, PC } },
  };
};

export { IMP, ACC, IMM, ZERO_PAGE, ZERO_PAGE_X, ZERO_PAGE_Y, RELATIVE, ABS };
