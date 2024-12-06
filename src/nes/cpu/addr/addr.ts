import { readBusNes } from "@/nes/bus/bus";
import { Nes } from "@/nes/nes";
import { setPC } from "../cpu";

export type Addr = {
  acc?: boolean;
  addr?: number;
  data: number;
  nes: Nes;
};

const IMP = (nes: Nes): Addr => ({
  nes: setPC(nes.cpu.PC + 1, nes),
  data: 0,
});

const ACC = (nes: Nes): Addr => ({
  nes: setPC(nes.cpu.PC + 1, nes),
  data: nes.cpu.ACC,
  acc: true,
});

const IMM = (nes: Nes): Addr => {
  const { cpu } = nes;
  let PC = cpu.PC + 1;
  const addr = PC;
  const [data, nesData] = readBusNes(addr, nes);
  PC++;
  return {
    nes: setPC(PC, nesData),
    data,
    addr: addr,
  };
};

const ZERO_PAGE = (nes: Nes): Addr => {
  const { cpu } = nes;
  let PC = cpu.PC + 1;

  const [zeroPageAddr, nesAddr] = readBusNes(PC, nes);

  const [data, nesData] = readBusNes(zeroPageAddr, nesAddr);

  PC++;
  return {
    nes: setPC(PC, nesData),
    data,
    cross: false,
    addr: zeroPageAddr,
  };
};

const ZERO_PAGE_X = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC + 1;

  let cross = false;

  let [addr, nesAddr] = readBusNes(PC, nes);
  addr += cpu.X;

  if (addr > 0xff) {
    addr = 0xff & addr;
    cross = true;
  }

  const [data, nesData] = readBusNes(addr, nesAddr);

  PC++;

  return {
    cross,
    data,
    nes: setPC(PC, nesData),
    addr,
  };
};

const ZERO_PAGE_Y = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC + 1;

  let cross = false;

  let [addr, nesAddr] = readBusNes(PC, nes);
  addr += cpu.Y;

  if (addr > 0xff) {
    addr = 0xff & addr;
    cross = true;
  }

  const [data, nesData] = readBusNes(addr, nesAddr);

  PC++;

  return {
    cross,
    data,
    nes: setPC(PC, nesData),
    addr,
  };
};

const RELATIVE = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC + 1;

  const addr = PC;

  let [data, nesData] = readBusNes(addr, nes);

  if (((data >> 7) & 1) == 1) data = (-1 << 8) | data;

  PC++;

  return {
    cross: false,
    data,
    nes: setPC(PC, nesData),
    addr,
  };
};

const ABS = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC + 1;

  const [low, nesLow] = readBusNes(PC++, nes);
  const [high, nesHigh] = readBusNes(PC, nesLow);

  const addr = (high << 8) | low;

  PC++;

  const [data, _nes] = readBusNes(addr, nesHigh);

  return {
    cross: false,
    data,
    nes: setPC(PC, _nes),
    addr,
  };
};

export const ABS_ADDR = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC + 1;

  const [low, nesLow] = readBusNes(PC++, nes);
  const [high, nesHigh] = readBusNes(PC, nesLow);

  const addr = (high << 8) | low;

  PC++;

  return {
    cross: false,
    data: 0,
    nes: setPC(PC, nesHigh),
    addr,
  };
};

const ABSX = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC + 1;

  const [low, nesLow] = readBusNes(PC++, nes);
  const [high, nesHigh] = readBusNes(PC, nesLow);

  const addr = ((high << 8) | low) + cpu.X;

  const cross = low + cpu.X > 0xff;

  PC++;

  const [data, _nes] = readBusNes(addr, nesHigh);

  return {
    cross,
    data,
    nes: setPC(PC, _nes),
    addr,
  };
};

export const ABSX_ADDR = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC + 1;

  const [low, nesLow] = readBusNes(PC++, nes);
  const [high, nesHigh] = readBusNes(PC, nesLow);

  const addr = ((high << 8) | low) + cpu.X;

  const cross = low + cpu.X > 0xff;

  PC++;

  return {
    cross,
    data: 0,
    nes: setPC(PC, nesHigh),
    addr,
  };
};

const ABSY = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC + 1;

  const [low, nesLow] = readBusNes(PC++, nes);
  const [high, nesHigh] = readBusNes(PC, nesLow);

  const addr = ((high << 8) | low) + cpu.Y;

  const cross = low + cpu.Y > 0xff;

  const [data, _nes] = readBusNes(addr, nesHigh);

  PC++;

  return {
    cross,
    data,
    nes: setPC(PC, _nes),
    addr,
  };
};

export const ABSY_ADDR = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC + 1;

  const [low, nesLow] = readBusNes(PC++, nes);
  const [high, nesHigh] = readBusNes(PC, nesLow);

  const addr = ((high << 8) | low) + cpu.Y;

  const cross = low + cpu.Y > 0xff;

  PC++;

  return {
    cross,
    data: 0,
    nes: setPC(PC, nesHigh),
    addr,
  };
};

const INDIRECT = (nes: Nes): Addr => {
  const { cpu } = nes;

  let PC = cpu.PC;
  let cross = false;
  const [lowAddr, nesLowAddr] = readBusNes(++PC, nes);
  const [highAddr, nesHighAddr] = readBusNes(++PC, nesLowAddr);

  if (lowAddr >= 0xff) cross = true;

  const low = (highAddr << 8) | lowAddr;
  const high = (highAddr << 8) | (lowAddr + 1) % 256;

  const [lowValue, nesLowValue] = readBusNes(low, nesHighAddr);
  const [highValue, nesHighValue] = readBusNes(high, nesLowValue);

  const data = (highValue << 8) | lowValue;

  PC++;

  return {
    cross,
    data,
    nes: setPC(PC, nesHighValue),
  };
};

const INDEXED_INDIRECT = (nes: Nes): Addr => {
  const { cpu } = nes;
  let PC = cpu.PC;
  const X = cpu.X;
  const [addr, nesAddr] = readBusNes(++PC, nes);
  const cross = X + addr + 1 > 0xff;
  const [low, nesLow] = readBusNes((addr + X) % 256, nesAddr);
  const [high, nesHigh] = readBusNes((addr + X + 1) % 256, nesLow);
  const finalAddr = (high << 8) | low;
  const [data, nesData] = readBusNes(finalAddr, nesHigh);

  PC++;

  return {
    data,
    cross,
    addr: finalAddr,
    nes: setPC(PC, nesData),
  };
};

export const INDEXED_INDIRECT_ADDR = (nes: Nes): Addr => {
  const { cpu } = nes;
  let PC = cpu.PC;
  const X = cpu.X;
  const [addr, nesAddr] = readBusNes(++PC, nes);
  const cross = X + addr + 1 > 0xff;
  const [low, nesLow] = readBusNes((addr + X) % 256, nesAddr);
  const [high, nesHigh] = readBusNes((addr + X + 1) % 256, nesLow);

  const finalAddr = (high << 8) | low;
  PC++;

  return {
    data: 0,
    cross,
    addr: finalAddr,
    nes: setPC(PC, nesHigh),
  };
};

const INDIRECT_INDEXED = (nes: Nes): Addr => {
  const { cpu } = nes;
  let PC = cpu.PC;
  const Y = cpu.Y;
  const [addr, nesAddr] = readBusNes(++PC, nes);
  let cross = addr + 1 > 0xff;
  const [low, nesLow] = readBusNes(addr % 256, nesAddr);
  const [high, nesHigh] = readBusNes((addr + 1) % 256, nesLow);
  cross ||= low + Y > 0xff;
  const finalAddr = (high << 8) | (low + Y) % 256;
  const [data, nesData] = readBusNes(finalAddr, nesHigh);

  PC++;

  return {
    data,
    addr: finalAddr,
    cross,
    nes: setPC(PC, nesData),
  };
};

export const INDIRECT_INDEXED_ADDR = (nes: Nes): Addr => {
  const { cpu } = nes;
  let PC = cpu.PC;
  const Y = cpu.Y;
  const [addr, nesAddr] = readBusNes(++PC, nes);
  let cross = addr + 1 > 0xff;
  const [low, nesLow] = readBusNes(addr % 256, nesAddr);
  const [high, nesHigh] = readBusNes((addr + 1) % 256, nesLow);
  cross ||= low + Y > 0xff;
  const finalAddr = (high << 8) | (low + Y) % 256;

  PC++;

  return {
    data: 0,
    addr: finalAddr,
    cross,
    nes: setPC(PC, nesHigh),
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
