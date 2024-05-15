import { useGameLoop } from "@/hooks/game-loop/game-loop";
import { createMushroomWord } from "@/nes/debug/background-creator";

export default function GameLoop() {
  const nes = useGameLoop(createMushroomWord());
}
