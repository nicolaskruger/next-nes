import { Read, ReadData, readBusNes, writeBusNes } from "@/nes/bus/bus";
import { Nes, nesBuilder } from "@/nes/nes";
import { readSprRam, writeSprRam } from "../spr-ram/spr-ram";
import { Dictionary } from "@/nes/helper/dictionary";
import { AddrVRamStatus, getFirstRead } from "../ppu";
import { writeVRam } from "../vram/vram";

export const getNameTable = (nes: Nes): ReadData => {
  const [reg2000, nesReg2000] = readBusNes(0x2000, nes);
  const data = reg2000 & (1 | (1 << 1));
  return [[0x2000, 0x2400, 0x2800, 0x2c00][data], nesReg2000];
};

export const getAmountIncrement = (nes: Nes): ReadData => {
  const [reg2000, nesReg2000] = readBusNes(0x2000, nes);
  const data = (reg2000 >> 2) & 1;

  return [[1, 32][data], nesReg2000];
};

export const getPatternTableSprite = (nes: Nes): ReadData => {
  const [reg2000, nesReg2000] = readBusNes(0x2000, nes);
  const data = (reg2000 >> 3) & 1;
  return [[0x0000, 0x1000][data], nesReg2000];
};

export const getPatternTableBackground = (nes: Nes): ReadData => {
  const [reg2000, nesReg2000] = readBusNes(0x2000, nes);

  const data = (reg2000 >> 4) & 1;
  return [[0x0000, 0x1000][data], nesReg2000];
};

type SizeOfSprite = "8x8" | "8x16";

export const getSizeOfSprite = (nes: Nes): [SizeOfSprite, Nes] => {
  const [reg2000, nesReg2000] = readBusNes(0x2000, nes);

  const data = (reg2000 >> 5) & 1;
  const ret: SizeOfSprite[] = ["8x8", "8x16"];
  return [ret[data], nesReg2000];
};

const isRegister = (
  nes: Nes,
  register: number,
  bit: number
): [boolean, Nes] => {
  const [reg, nesReg] = readBusNes(register, nes);
  return [!!((reg >> bit) & 1), nesReg];
};

export const isMNIOccur = (nes: Nes): [boolean, Nes] =>
  isRegister(nes, 0x2000, 7);

type ColorMode = "mono" | "color";

export const getColorMode = (nes: Nes): [ColorMode, Nes] => {
  const [reg2001, nesReg2001] = readBusNes(0x2001, nes);
  const data = reg2001 & 1;
  const ret: ColorMode[] = ["color", "mono"];
  return [ret[data], nesReg2001];
};

export const isBgLeftMost8Pix = (nes: Nes): [boolean, Nes] =>
  isRegister(nes, 0x2001, 1);

export const isSprLeftMost8Pix = (nes: Nes): [boolean, Nes] =>
  isRegister(nes, 0x2001, 2);

export const isDisableBg = (nes: Nes): [boolean, Nes] =>
  isRegister(nes, 0x2001, 3);

export const isDisableSpr = (nes: Nes): [boolean, Nes] =>
  isRegister(nes, 0x2001, 4);

export const shouldIgnoreWritesToVRAM = (nes: Nes): [boolean, Nes] =>
  isRegister(nes, 0x2002, 4);

export const isMoreThan8SpritesOnScanLine = (nes: Nes): [boolean, Nes] =>
  isRegister(nes, 0x2002, 5);

export const isZeroHitFlag = (nes: Nes): [boolean, Nes] =>
  isRegister(nes, 0x2002, 6);

export const isVBlankOccurring = (nes: Nes): [boolean, Nes] =>
  isRegister(nes, 0x2002, 7);

export const read2003SprAddr = (nes: Nes) => readBusNes(0x2003, nes);

const writeStatusRegister: Dictionary<
  AddrVRamStatus,
  (value: number, nes: Nes) => Nes
> = {
  hight: (value, nes) =>
    nesBuilder(nes)
      .ppuRegister(value << 8)
      .ppuStatusRegister("low")
      .build(),
  low: (value, nes) =>
    nesBuilder(nes)
      .ppuRegister(value | getAddrVRam(nes))
      .ppuStatusRegister("hight")
      .build(),
};

export const write2006AddrVRam = (value: number, nes: Nes): Nes => {
  return writeStatusRegister[getPpuRegisterStatus(nes)](value, nes);
};

export const readPpuDataVRam = (addr: number, nes: Nes): number => {
  throw new Error("not implemented");
};

const calcNewAddrVRam = (nes: Nes): ReadData => {
  const [amountIncrement, nesAmountIncrement] = getAmountIncrement(nes);
  const nextAddr = getAddrVRam(nes) + amountIncrement;
  return [nextAddr, nesAmountIncrement];
};

export const write2007DataVRam = (data: number, nes: Nes): Nes => {
  let _nes = writeVRam(getAddrVRam(nes), data, nes);

  const [nextAddr, nesNextAddr] = calcNewAddrVRam(_nes);

  return nesBuilder(nesNextAddr).addrVram(nextAddr).build();
};

export const read2007DataVRam = (nes: Nes): [data: number, nes: Nes] => {
  if (getFirstRead(nes)) {
    return [0, nesBuilder(nes).firstReadPpu(false).build()];
  } else {
    const [nextAddr, nesNextAddr] = calcNewAddrVRam(nes);
    const [result, nesResult] = readSprRam(getAddrVRam(nes), nesNextAddr);
    return [
      result,
      nesBuilder(nesResult).addrVram(nextAddr).firstReadPpu(true).build(),
    ];
  }
};

export const getAddrVRam = (nes: Nes) => nes.ppu.addrVRam;

export const getPpuRegisterStatus = (nes: Nes) => nes.ppu.addrVramStatus;

export const write2004SprRam = (addr: number, value: number, nes: Nes): Nes => {
  const [sprAddr, nesAddr] = read2003SprAddr(nes);

  let _nes = writeSprRam(sprAddr, value, nesAddr);
  _nes.bus[addr].data = value;
  return _nes;
};

export const read2004SprRam: Read = (addr, nes) => {
  const [reg2003, nesReg2003] = read2003SprAddr(nes);
  return readSprRam(reg2003, nesReg2003);
};
