import { Nes } from "@/nes/nes";

type Addr = {
  cross: boolean;
  data: number;
  nes: Nes;
};

const IMP = (nes: Nes): Addr => ({ nes, data: 0, cross: false });

const ACC = (nes: Nes): Addr => ({ nes, data: nes.cpu.ACC, cross: false });

export { IMP, ACC };
