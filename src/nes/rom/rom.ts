import { error } from "console";
import { Nes, initNes } from "../nes";
import {
  bankSize,
  getChrRom,
  getPrgRom,
  setChrRom,
  setPrgRom,
  startChrRom,
  startPrgRom,
} from "../banks/bank";
import { repeat } from "../helper/repeat";
import { fourScreen, horizontalMirror, verticalMirror } from "../ppu/vram/vram";
import { writeBusNes } from "../bus/bus";

const validFile = (rom: File) => {
  if (!/\.nes$/gi.test(rom.name)) throw new Error("invalid format");
};

const validChar = (char: string, byte: number, nes: Nes) => {
  if (char.charCodeAt(0) !== byte) throw new Error(`invalid char ${char}`);
  return nes;
};

const header: ((byte: number, nes: Nes) => Nes)[] = [
  (byte, nes) => validChar("N", byte, nes),
  (byte, nes) => validChar("E", byte, nes),
  (byte, nes) => validChar("S", byte, nes),
  (byte, nes) => {
    if (byte !== 0x1a) throw new Error("invalid format");
    return nes;
  },
  (byte, nes) => {
    nes.banks.prgRom = bankSize(byte);
    return nes;
  },
  (byte, nes) => {
    nes.banks.chrRom = bankSize(byte);
    return nes;
  },
];

const splitByte = (byte: number) => repeat(8).map((_, i) => (byte >> i) & 1);

const joinByte = (...bits: number[]): number =>
  bits.reduce((acc, curr, i) => acc | (curr << i), 0);

type Byte6 = {
  nes: Nes;
  lowMapper: number;
  battery: boolean;
  byteTrainer: boolean;
};

const byte6 = (byte: number, nes: Nes): Byte6 => {
  const [bit0, bit1, bit2, bit3, ...lowMapper] = splitByte(byte);

  let _nes = { ...nes };

  if (bit3) {
    _nes = fourScreen(_nes);
  } else if (bit0) {
    _nes = verticalMirror(_nes);
  } else {
    _nes = horizontalMirror(_nes);
  }

  return {
    nes: _nes,
    lowMapper: joinByte(...lowMapper),
    battery: Boolean(bit1),
    byteTrainer: Boolean(bit2),
  };
};

export const KB16 = (0x10000 - 0x8000) / 2;
export const KB8 = KB16 / 2;

export const rom = async (nes: Nes, rom: File): Promise<Nes> => {
  let _nes = initNes();
  validFile(rom);
  const buffer = Buffer.from(await rom.arrayBuffer());
  const romBytes: number[] = [];
  buffer.forEach((byte) => romBytes.push(byte));
  romBytes.slice(0, 6).forEach((byte, i) => {
    _nes = header[i](byte, _nes);
  });

  const { nes: nes6, lowMapper, byteTrainer } = byte6(romBytes[6], _nes);
  _nes = nes6;

  const mapper = (romBytes[7] >> 4) | lowMapper;

  if (mapper !== 0) {
    throw new Error("mapper not implemented");
  }

  let bT: number[] = [];
  const skip = byteTrainer ? 512 + 16 : 16;

  if (byteTrainer) bT = romBytes.slice(16, 512 + 16);

  let prgRom = getPrgRom(_nes);

  if (prgRom.length === 1) {
    const _rom = romBytes.slice(skip, skip + KB16);
    prgRom = [_rom, _rom];
  } else
    prgRom = prgRom.map((_, i) =>
      romBytes.slice(skip + i * KB16, skip + (i + 1) * KB16)
    );

  _nes = setPrgRom(_nes, prgRom);

  let chrRom = getChrRom(_nes);

  const chrStart = prgRom.length * KB16 + skip;

  chrRom = chrRom.map((_, i) =>
    romBytes.slice(chrStart + i * KB8, chrStart + (i + 1) * KB8)
  );

  _nes = setChrRom(_nes, chrRom);

  _nes = startPrgRom(_nes);
  _nes = startChrRom(_nes);

  _nes = writeBusNes(0x2002, 1 << 7, _nes);
  return _nes;
};
