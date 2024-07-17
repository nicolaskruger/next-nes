import { Nes } from "@/nes/nes";

export type Refresh = {
  refreshPallet?: (addr: number) => void;
};

export const initRefresh = (): Refresh => ({});

export const refreshPallet = (nes: Nes, addr: number) => {
  const { refreshPallet } = nes.ppu.refresh;
  if (refreshPallet) refreshPallet(addr);
};

export const setRefreshPallet = (
  nes: Nes,
  refreshPallet: (addr: number) => void
) => {
  nes.ppu.refresh.refreshPallet = refreshPallet;
  return nes;
};
