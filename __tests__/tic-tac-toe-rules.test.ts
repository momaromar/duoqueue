import { GAME_PRESET_KEYS, getGamePreset } from "@/src/features/games/tic-tac-toe/presets";
import {
  GameRuleError,
  cellToIndex,
  createEmptyBoard,
  findWinningLine,
  indexToCell,
  reconstructBoard,
} from "@/src/features/games/tic-tac-toe/rules";
import type { GameMark, GameMove, GamePresetKey } from "@/src/features/games/tic-tac-toe/types";

function uuid(value: number) {
  return `10000000-0000-4000-8000-${value.toString().padStart(12, "0")}`;
}

function move(moveNumber: number, row: number, column: number, mark?: GameMark): GameMove {
  let resolvedMark: GameMark = "O";
  if (moveNumber % 2 === 1) resolvedMark = "X";
  if (mark) resolvedMark = mark;
  let userValue = 902;
  if (resolvedMark === "X") userValue = 901;
  return {
    id: uuid(moveNumber),
    moveNumber,
    row,
    column,
    mark: resolvedMark,
    userId: uuid(userValue),
    createdAt: "2026-08-24T12:00:00.000Z",
  };
}

describe("Tic-Tac-Toe presets and coordinates", () => {
  it.each([
    ["classic", 3, 3],
    ["quick", 5, 4],
    ["extended", 7, 5],
    ["large", 10, 5],
  ] as const)("maps %s to its fixed dimensions", (key, boardSize, winLength) => {
    expect(getGamePreset(key)).toMatchObject({ boardSize, winLength });
    expect(createEmptyBoard(key)).toHaveLength(boardSize);
    expect(createEmptyBoard(key).flat()).toHaveLength(boardSize * boardSize);
  });

  it("round-trips every linear cell index", () => {
    GAME_PRESET_KEYS.forEach((key) => {
      const { boardSize } = getGamePreset(key);
      for (let index = 0; index < boardSize * boardSize; index += 1) {
        const cell = indexToCell(index, boardSize);
        expect(cellToIndex(cell.row, cell.column, boardSize)).toBe(index);
      }
    });
    expect(() => indexToCell(9, 3)).toThrow(GameRuleError);
  });
});

describe("large-board geometry", () => {
  it("fits the whole logical board and clamps translation at each scale", () => {
    expect(getBoardMinimumScale(280, 560)).toBe(0.5);
    expect(getBoardMinimumScale(600, 560)).toBe(1);
    expect(clampBoardTranslation(500, 1, 560, 280)).toBe(140);
    expect(clampBoardTranslation(-500, 1, 560, 280)).toBe(-140);
    expect(clampBoardTranslation(40, 0.5, 560, 280)).toBe(0);
  });

  it("resolves cells only inside the transformed board", () => {
    const transform = { scale: 0.5, translateX: 0, translateY: 0 };
    expect(resolveBoardCell(14, 14, transform, 280, 560, 56, 10)).toEqual({ row: 0, column: 0 });
    expect(resolveBoardCell(279, 279, transform, 280, 560, 56, 10)).toEqual({ row: 9, column: 9 });
    expect(resolveBoardCell(-1, 50, transform, 280, 560, 56, 10)).toBeNull();
  });

  it("centers the latest move while keeping the board within bounds", () => {
    expect(getCenteredCellTransform(0, 0, 0.5, 280, 560, 56)).toEqual({
      scale: 1,
      translateX: 140,
      translateY: 140,
    });
    expect(getCenteredCellTransform(9, 9, 0.5, 280, 560, 56)).toEqual({
      scale: 1,
      translateX: -140,
      translateY: -140,
    });
  });
});

describe("Tic-Tac-Toe winning lines", () => {
  const cases: { name: string; cells: [number, number][]; last: [number, number] }[] = [
    { name: "horizontal edge", cells: [[0, 0], [0, 1], [0, 2]], last: [0, 2] },
    { name: "vertical interior", cells: [[0, 1], [1, 1], [2, 1]], last: [2, 1] },
    { name: "descending diagonal", cells: [[0, 0], [1, 1], [2, 2]], last: [2, 2] },
    { name: "ascending diagonal", cells: [[0, 2], [1, 1], [2, 0]], last: [2, 0] },
  ];

  it.each(cases)("detects $name", ({ cells, last }) => {
    const board = createEmptyBoard("classic");
    cells.forEach(([row, column]) => { board[row][column] = "X"; });
    const line = findWinningLine(board, { row: last[0], column: last[1], mark: "X" }, "classic");
    expect(line.map((cell) => [cell.row, cell.column])).toEqual(cells);
  });

  it("uses direction priority when the latest move creates intersecting wins", () => {
    const board = createEmptyBoard("classic");
    [[1, 0], [1, 1], [1, 2], [0, 1], [2, 1]].forEach(([row, column]) => { board[row][column] = "X"; });
    const line = findWinningLine(board, { row: 1, column: 1, mark: "X" }, "classic");
    expect(line.map((cell) => [cell.row, cell.column])).toEqual([[1, 0], [1, 1], [1, 2]]);
  });

  it("selects the row-major-earliest overlength segment containing the latest move", () => {
    const board = createEmptyBoard("quick");
    for (let column = 0; column < 5; column += 1) board[2][column] = "O";
    const line = findWinningLine(board, { row: 2, column: 2, mark: "O" }, "quick");
    expect(line.map((cell) => cell.column)).toEqual([0, 1, 2, 3]);
  });
});

describe("Tic-Tac-Toe board reconstruction", () => {
  it("reconstructs an ordinary win and reports the stored winning cells", () => {
    const moves = [
      move(1, 0, 0), move(2, 1, 0), move(3, 0, 1), move(4, 1, 1), move(5, 0, 2),
    ];
    const result = reconstructBoard("classic", moves);
    expect(result.winner).toBe("X");
    expect(result.isDraw).toBe(false);
    expect(result.winningLine.map((cell) => cell.index)).toEqual([0, 1, 2]);
  });

  it("detects a full-board draw", () => {
    const moves = [
      move(1, 0, 0), move(2, 0, 1), move(3, 0, 2),
      move(4, 1, 1), move(5, 1, 0), move(6, 1, 2),
      move(7, 2, 1), move(8, 2, 0), move(9, 2, 2),
    ];
    expect(reconstructBoard("classic", moves)).toMatchObject({ winner: null, isDraw: true });
  });

  it.each([
    ["duplicate IDs", [move(1, 0, 0), { ...move(2, 1, 0), id: uuid(1) }]],
    ["duplicate move numbers", [move(1, 0, 0), { ...move(2, 1, 0), moveNumber: 1 }]],
    ["duplicate cells", [move(1, 0, 0), move(2, 0, 0)]],
    ["out-of-range cells", [move(1, 3, 0)]],
    ["incorrect mark order", [move(1, 0, 0, "O")]],
  ])("rejects %s", (_name, moves) => {
    expect(() => reconstructBoard("classic", moves as GameMove[])).toThrow(GameRuleError);
  });

  it("rejects moves after a winning move", () => {
    const moves = [
      move(1, 0, 0), move(2, 1, 0), move(3, 0, 1), move(4, 1, 1), move(5, 0, 2), move(6, 2, 2),
    ];
    expect(() => reconstructBoard("classic", moves)).toThrow("Moves cannot follow a winning move.");
  });

  it.each(GAME_PRESET_KEYS)("accepts an empty %s board", (presetKey: GamePresetKey) => {
    expect(reconstructBoard(presetKey, []).board).toEqual(createEmptyBoard(presetKey));
  });
});
import {
  clampBoardTranslation,
  getBoardMinimumScale,
  getCenteredCellTransform,
  resolveBoardCell,
} from "@/src/features/games/tic-tac-toe/boardGeometry";
