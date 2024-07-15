import { Nes } from "@/nes/nes";
import { getSTK } from "../cpu";

export type NMI = {
  occur: boolean;
  stk: number;
};
export type Interrupt = {
  nmi: NMI;
};

const initNMI = (): NMI => ({
  occur: false,
  stk: -1,
});

export const initInterrupt = (): Interrupt => ({
  nmi: initNMI(),
});

export const getNMIInfo = (nes: Nes): NMI => nes.cpu.interrupt.nmi;

export const finishNMI = (nes: Nes, STK: number): Nes => {
  const nmi = getNMIInfo(nes);
  if (nmi.occur && nmi.stk === STK) {
    nmi.stk = -1;
    nmi.occur = false;
  }
  return nes;
};

export const startNMI = (nes: Nes): Nes => {
  const nmi = getNMIInfo(nes);
  nmi.occur = true;
  nmi.stk = getSTK(nes);
  return nes;
};
