import type { GamePreset, GamePresetKey } from "@/src/features/games/tic-tac-toe/types";

export const GAME_PRESETS: Record<GamePresetKey, GamePreset> = {
  classic: { key: "classic", label: "Classic 3 × 3", boardSize: 3, winLength: 3 },
  quick: { key: "quick", label: "Quick 5 × 5", boardSize: 5, winLength: 4 },
  extended: { key: "extended", label: "Extended 7 × 7", boardSize: 7, winLength: 5 },
  large: { key: "large", label: "Large 10 × 10", boardSize: 10, winLength: 5 },
};

export const GAME_PRESET_KEYS: GamePresetKey[] = ["classic", "quick", "extended", "large"];

export function getGamePreset(key: GamePresetKey) {
  return GAME_PRESETS[key];
}
