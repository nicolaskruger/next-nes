import { dexToHexSixDigitsPrefixHash } from "@/nes/helper/converter";

export const rgb = (r: number, g: number, b: number) =>
  (r << 16) | (g << 8) | b;

export const COLOR_PALLET: number[] = [
  rgb(0x75, 0x75, 0x75),
  rgb(0x27, 0x1b, 0x8f),
  rgb(0x00, 0x00, 0xab),
  rgb(0x47, 0x00, 0x9f),
  rgb(0x8f, 0x00, 0x77),
  rgb(0xab, 0x00, 0x13),
  rgb(0xa7, 0x00, 0x00),
  rgb(0x7f, 0x0b, 0x00),
  rgb(0x43, 0x2f, 0x00),
  rgb(0x00, 0x47, 0x00),
  rgb(0x00, 0x51, 0x00),
  rgb(0x00, 0x3f, 0x17),
  rgb(0x1b, 0x3f, 0x5f),
  rgb(0x00, 0x00, 0x00),
  rgb(0x00, 0x00, 0x00),
  rgb(0x00, 0x00, 0x00),
  rgb(0xbc, 0xbc, 0xbc),
  rgb(0x00, 0x73, 0xef),
  rgb(0x23, 0x3b, 0xef),
  rgb(0x83, 0x00, 0xf3),
  rgb(0xbf, 0x00, 0xbf),
  rgb(0xe7, 0x00, 0x5b),
  rgb(0xdb, 0x2b, 0x00),
  rgb(0xcb, 0x4f, 0x0f),
  rgb(0x8b, 0x73, 0x00),
  rgb(0x00, 0x97, 0x00),
  rgb(0x00, 0xab, 0x00),
  rgb(0x00, 0x93, 0x3b),
  rgb(0x00, 0x83, 0x8b),
  rgb(0x00, 0x00, 0x00),
  rgb(0x00, 0x00, 0x00),
  rgb(0x00, 0x00, 0x00),
  rgb(0xff, 0xff, 0xff),
  rgb(0x3f, 0xbf, 0xff),
  rgb(0x5f, 0x97, 0xff),
  rgb(0xa7, 0x8b, 0xfd),
  rgb(0xf7, 0x7b, 0xff),
  rgb(0xff, 0x77, 0xb7),
  rgb(0xff, 0x77, 0x63),
  rgb(0xff, 0x9b, 0x3b),
  rgb(0xf3, 0xbf, 0x3f),
  rgb(0x83, 0xd3, 0x13),
  rgb(0x4f, 0xdf, 0x4b),
  rgb(0x58, 0xf8, 0x98),
  rgb(0x00, 0xeb, 0xdb),
  rgb(0x00, 0x00, 0x00),
  rgb(0x00, 0x00, 0x00),
  rgb(0x00, 0x00, 0x00),
  rgb(0xff, 0xff, 0xff),
  rgb(0xab, 0xe7, 0xff),
  rgb(0xc7, 0xd7, 0xff),
  rgb(0xd7, 0xcb, 0xff),
  rgb(0xff, 0xc7, 0xff),
  rgb(0xff, 0xc7, 0xdb),
  rgb(0xff, 0xbf, 0xb3),
  rgb(0xff, 0xdb, 0xab),
  rgb(0xff, 0xe7, 0xa3),
  rgb(0xe3, 0xff, 0xa3),
  rgb(0xab, 0xf3, 0xbf),
  rgb(0xb3, 0xff, 0xcf),
  rgb(0x9f, 0xff, 0xf3),
  rgb(0x00, 0x00, 0x00),
  rgb(0x00, 0x00, 0x00),
  rgb(0x00, 0x00, 0x00),
];

export const colorToHex = (index: number) =>
  dexToHexSixDigitsPrefixHash(COLOR_PALLET[index]);
