export type BoardTransform = {
  scale: number;
  translateX: number;
  translateY: number;
};

export function getBoardMinimumScale(viewportSize: number, boardPixels: number) {
  "worklet";
  if (viewportSize <= 0 || boardPixels <= 0) return 1;
  return Math.min(1, viewportSize / boardPixels);
}

export function clampBoardTranslation(
  value: number,
  currentScale: number,
  boardPixels: number,
  viewportSize: number,
) {
  "worklet";
  const maximum = Math.max(0, (boardPixels * currentScale - viewportSize) / 2);
  return Math.min(maximum, Math.max(-maximum, value));
}

export function resolveBoardCell(
  x: number,
  y: number,
  transform: BoardTransform,
  viewportSize: number,
  boardPixels: number,
  cellSize: number,
  boardSize: number,
) {
  "worklet";
  const scaledBoard = boardPixels * transform.scale;
  const left = (viewportSize - scaledBoard) / 2 + transform.translateX;
  const top = (viewportSize - scaledBoard) / 2 + transform.translateY;
  const column = Math.floor((x - left) / (cellSize * transform.scale));
  const row = Math.floor((y - top) / (cellSize * transform.scale));
  if (row < 0 || row >= boardSize || column < 0 || column >= boardSize) return null;
  return { row, column };
}

export function getCenteredCellTransform(
  row: number,
  column: number,
  minimumScale: number,
  viewportSize: number,
  boardPixels: number,
  cellSize: number,
): BoardTransform {
  "worklet";
  const nextScale = Math.max(1, minimumScale);
  const scaledBoard = boardPixels * nextScale;
  const cellX = (column + 0.5) * cellSize * nextScale;
  const cellY = (row + 0.5) * cellSize * nextScale;
  const translateX = clampBoardTranslation(
    scaledBoard / 2 - cellX,
    nextScale,
    boardPixels,
    viewportSize,
  );
  const translateY = clampBoardTranslation(
    scaledBoard / 2 - cellY,
    nextScale,
    boardPixels,
    viewportSize,
  );
  return { scale: nextScale, translateX, translateY };
}
