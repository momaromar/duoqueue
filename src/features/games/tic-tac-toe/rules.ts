import { getGamePreset } from "@/src/features/games/tic-tac-toe/presets";
import type {
  GameBoardGrid,
  GameMark,
  GameMove,
  GamePresetKey,
  ReconstructedGame,
  WinningCell,
} from "@/src/features/games/tic-tac-toe/types";

const DIRECTIONS = [
  { row: 0, column: 1 },
  { row: 1, column: 0 },
  { row: 1, column: 1 },
  { row: 1, column: -1 },
] as const;

export class GameRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GameRuleError";
  }
}

export function createEmptyBoard(presetKey: GamePresetKey): GameBoardGrid {
  const { boardSize } = getGamePreset(presetKey);
  return Array.from({ length: boardSize }, () => Array<GameMark | null>(boardSize).fill(null));
}

export function cellToIndex(row: number, column: number, boardSize: number) {
  return row * boardSize + column;
}

export function indexToCell(index: number, boardSize: number): WinningCell {
  if (!Number.isInteger(index) || index < 0 || index >= boardSize * boardSize) {
    throw new GameRuleError("Cell index is outside the board.");
  }
  const row = Math.floor(index / boardSize);
  const column = index % boardSize;
  return { row, column, index };
}

function insideBoard(row: number, column: number, boardSize: number) {
  return Number.isInteger(row)
    && Number.isInteger(column)
    && row >= 0
    && row < boardSize
    && column >= 0
    && column < boardSize;
}

export function findWinningLine(
  board: GameBoardGrid,
  lastMove: Pick<GameMove, "row" | "column" | "mark">,
  presetKey: GamePresetKey,
): WinningCell[] {
  const { boardSize, winLength } = getGamePreset(presetKey);
  if (!insideBoard(lastMove.row, lastMove.column, boardSize)) return [];
  if (board[lastMove.row]?.[lastMove.column] !== lastMove.mark) return [];

  for (const direction of DIRECTIONS) {
    const run: WinningCell[] = [];
    let row = lastMove.row;
    let column = lastMove.column;
    while (
      insideBoard(row - direction.row, column - direction.column, boardSize)
      && board[row - direction.row][column - direction.column] === lastMove.mark
    ) {
      row -= direction.row;
      column -= direction.column;
    }
    while (insideBoard(row, column, boardSize) && board[row][column] === lastMove.mark) {
      run.push({ row, column, index: cellToIndex(row, column, boardSize) });
      row += direction.row;
      column += direction.column;
    }
    if (run.length < winLength) continue;

    const latestIndex = run.findIndex(
      (cell) => cell.row === lastMove.row && cell.column === lastMove.column,
    );
    const firstStart = Math.max(0, latestIndex - winLength + 1);
    const lastStart = Math.min(latestIndex, run.length - winLength);
    let selected = run.slice(firstStart, firstStart + winLength);
    for (let start = firstStart + 1; start <= lastStart; start += 1) {
      const candidate = run.slice(start, start + winLength);
      if (candidate[0].index < selected[0].index) selected = candidate;
    }
    return selected;
  }
  return [];
}

export function reconstructBoard(presetKey: GamePresetKey, moves: readonly GameMove[]): ReconstructedGame {
  const preset = getGamePreset(presetKey);
  const board = createEmptyBoard(presetKey);
  const ids = new Set<string>();
  let winningLine: WinningCell[] = [];
  let winner: GameMark | null = null;

  moves.forEach((move, index) => {
    if (winner) throw new GameRuleError("Moves cannot follow a winning move.");
    if (ids.has(move.id)) throw new GameRuleError("Move IDs must be unique.");
    ids.add(move.id);
    if (move.moveNumber !== index + 1) throw new GameRuleError("Move numbers must be sequential.");
    let expectedMark: GameMark = "O";
    if (index % 2 === 0) expectedMark = "X";
    if (move.mark !== expectedMark) throw new GameRuleError("Moves must alternate X and O, beginning with X.");
    if (!insideBoard(move.row, move.column, preset.boardSize)) {
      throw new GameRuleError("Move is outside the board.");
    }
    if (board[move.row][move.column]) throw new GameRuleError("A cell may be played only once.");
    board[move.row][move.column] = move.mark;
    winningLine = findWinningLine(board, move, presetKey);
    if (winningLine.length > 0) winner = move.mark;
  });

  const isFull = moves.length === preset.boardSize * preset.boardSize;
  return { board, winner, winningLine, isDraw: isFull && !winner };
}
