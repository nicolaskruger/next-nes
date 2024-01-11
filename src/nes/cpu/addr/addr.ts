import { readBusNes } from "@/nes/bus/bus";
import { Nes } from "@/nes/nes";
import { setPC } from "../cpu";

export type Addr = {
  acc?: boolean;
  addr?: number;
  cross: boolean;
  data: number;
  nes: Nes;
};

const IMP = (nes: Nes): Addr => ({
  nes: setPC(nes.cpu.PC + 1, nes),
  data: 0,
  cross: false,
});

const ACC = (nes: Nes): Addr => ({
  nes: setPC(nes.cpu.PC + 1, nes),
  data: nes.cpu.ACC,
  cross: false,
  acc: true,
});

const IMM = (nes: Nes): Addr => {
  const { cpu } = nes;
  let PC = cpu.PC + 1;
  const addr = PC;
  const data = readBusNes(addr, nes);
  PC++;
  return {
    nes: setPC(PC, nes),
    data,
    cross: false,
    addr: addr,
  };
};

const ZERO_PAGE = (nes: Nes): Addr => {
  const { cpu } = nes;
  let PC = cpu.PC + 1;

  const zeroPageAddr = readBusNes(PC, nes);

  const data = readBusNes(zeroPageAddr, nes);

  PC++;
  return {
    nes: setPC(PC, nes),
    data,
    cross: false,
    addr: zeroPageAddr,
  };
};

const ZERO_PAGE_X = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC + 1;

  let cross = false;
  let addr = readBusNes(PC, nes) + cpu.X;

  if (addr > 0xff) {
    addr = 0xff & addr;
    cross = true;
  }

  const data = readBusNes(addr, nes);

  PC++;

  return {
    cross,
    data,
    nes: setPC(PC, nes),
    addr,
  };
};

const ZERO_PAGE_Y = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC + 1;

  let cross = false;
  let addr = readBusNes(PC, nes) + cpu.Y;

  if (addr > 0xff) {
    addr = 0xff & addr;
    cross = true;
  }

  const data = readBusNes(addr, nes);

  PC++;

  return {
    cross,
    data,
    nes: setPC(PC, nes),
    addr,
  };
};

const RELATIVE = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC + 1;

  const addr = PC;

  let data = readBusNes(addr, nes);

  if (((data >> 7) & 1) == 1) data = (-1 << 8) | data;

  PC++;

  return {
    cross: false,
    data,
    nes: setPC(PC, nes),
    addr,
  };
};

const ABS = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC + 1;

  const low = readBusNes(PC++, nes);
  const high = readBusNes(PC, nes);

  const addr = (high << 8) | low;

  const data = readBusNes(addr, nes);

  PC++;

  return {
    cross: false,
    data,
    nes: setPC(PC, nes),
    addr,
  };
};

const ABSX = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC + 1;

  const low = readBusNes(PC++, nes);
  const high = readBusNes(PC, nes);

  const addr = ((high << 8) | low) + cpu.X;

  const data = readBusNes(addr, nes);

  const cross = low + cpu.X > 0xff;

  PC++;

  return {
    cross,
    data,
    nes: setPC(PC, nes),
    addr,
  };
};

const ABSY = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC + 1;

  const low = readBusNes(PC++, nes);
  const high = readBusNes(PC, nes);

  const addr = ((high << 8) | low) + cpu.Y;

  const data = readBusNes(addr, nes);

  const cross = low + cpu.Y > 0xff;

  PC++;

  return {
    cross,
    data,
    nes: setPC(PC, nes),
    addr,
  };
};

const INDIRECT = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC;
  let cross = false;
  const lowAddr = readBusNes(++PC, nes);
  const highAddr = readBusNes(++PC, nes);

  if (lowAddr >= 0xff) cross = true;

  const low = (highAddr << 8) | lowAddr;
  const high = (highAddr << 8) | (lowAddr + 1) % 256;

  const lowValue = readBusNes(low, nes);
  const highValue = readBusNes(high, nes);

  const data = (highValue << 8) | lowValue;

  PC++;

  return {
    cross,
    data,
    nes: setPC(PC, nes),
  };
};

const INDEXED_INDIRECT = (nes: Nes): Addr => {
  const { cpu } = nes;
  let PC = cpu.PC;
  const X = cpu.X;
  const addr = readBusNes(++PC, nes);
  const cross = X + addr + 1 > 0xff;
  const low = readBusNes((addr + X) % 256, nes);
  const high = readBusNes((addr + X + 1) % 256, nes);
  const data = readBusNes((high << 8) | low, nes);

  PC++;

  return {
    data,
    cross,
    nes: setPC(PC, nes),
  };
};

const INDIRECT_INDEXED = (nes: Nes): Addr => {
  const { cpu } = nes;
  let PC = cpu.PC;
  const Y = cpu.Y;
  const addr = readBusNes(++PC, nes);
  let cross = addr + 1 > 0xff;
  const low = readBusNes(addr % 256, nes);
  const high = readBusNes((addr + 1) % 256, nes);
  cross ||= low + Y > 0xff;
  const data = readBusNes((high << 8) | (low + Y) % 256, nes);

  PC++;

  return {
    data,
    cross,
    nes: setPC(PC, nes),
  };
};

export {
  IMP,
  ACC,
  IMM,
  ZERO_PAGE,
  ZERO_PAGE_X,
  ZERO_PAGE_Y,
  RELATIVE,
  ABS,
  ABSX,
  ABSY,
  INDIRECT,
  INDEXED_INDIRECT,
  INDIRECT_INDEXED,
};
