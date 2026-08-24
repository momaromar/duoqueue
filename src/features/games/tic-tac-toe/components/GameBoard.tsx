import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View, type DimensionValue, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { getGamePreset } from "@/src/features/games/tic-tac-toe/presets";
import { cellToIndex, reconstructBoard } from "@/src/features/games/tic-tac-toe/rules";
import type { GameMark, GameMove, GameSnapshot } from "@/src/features/games/tic-tac-toe/types";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

const LARGE_CELL_SIZE = 56;
const MAX_SCALE = 2;

type GameBoardProps = {
  snapshot: GameSnapshot;
  viewerUserId: string;
  optimisticMove?: Pick<GameMove, "row" | "column" | "mark"> | null;
  allowHotSeat?: boolean;
  onMove?: (row: number, column: number) => void;
};

type CellProps = {
  row: number;
  column: number;
  mark: GameMark | null;
  disabled: boolean;
  isLast: boolean;
  isWinning: boolean;
  isOptimistic: boolean;
  size: DimensionValue;
  onPress: () => void;
  usePressable: boolean;
};

function GameCell({
  row,
  column,
  mark,
  disabled,
  isLast,
  isWinning,
  isOptimistic,
  size,
  onPress,
  usePressable,
}: CellProps) {
  let occupancy = "empty";
  if (mark) occupancy = `occupied by ${mark}`;
  const label = `Row ${row + 1}, column ${column + 1}, ${occupancy}`;
  let innerAccessible: true | undefined;
  let innerRole: "button" | undefined;
  let innerLabel: string | undefined;
  let innerState: { disabled: boolean } | undefined;
  let innerActions: { name: "activate"; label: string }[] | undefined;
  let innerAccessibilityTap: (() => void) | undefined;
  let innerAccessibilityAction: ((event: { nativeEvent: { actionName: string } }) => void) | undefined;
  if (!usePressable) {
    innerAccessible = true;
    innerRole = "button";
    innerLabel = label;
    innerState = { disabled };
    innerActions = [{ name: "activate", label: `Play row ${row + 1}, column ${column + 1}` }];
    innerAccessibilityTap = () => {
      if (!disabled) onPress();
    };
    innerAccessibilityAction = (event) => {
      if (event.nativeEvent.actionName === "activate" && !disabled) onPress();
    };
  }
  let visualSize = size;
  if (usePressable) visualSize = "100%";
  const content = (
    <View
      accessible={innerAccessible}
      accessibilityRole={innerRole}
      accessibilityLabel={innerLabel}
      accessibilityState={innerState}
      accessibilityActions={innerActions}
      onAccessibilityTap={innerAccessibilityTap}
      onAccessibilityAction={innerAccessibilityAction}
      style={[
        styles.cell,
        { width: visualSize, height: visualSize },
        isLast && styles.lastCell,
        isWinning && styles.winningCell,
        isOptimistic && styles.optimisticCell,
        disabled && styles.disabledCell,
      ]}
    >
      <Text style={[styles.mark, mark === "X" && styles.markX, mark === "O" && styles.markO]}>{mark}</Text>
      {isLast && <Text style={styles.cellIndicator}>LAST</Text>}
      {isWinning && <Text style={styles.cellIndicator}>WIN</Text>}
      {isOptimistic && <Text style={styles.cellIndicator}>PENDING</Text>}
    </View>
  );
  if (!usePressable) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        { width: size, height: size },
        pressed && !disabled && styles.pressedCell,
      ]}
    >
      {content}
    </Pressable>
  );
}

function useBoardCells({ snapshot, viewerUserId, optimisticMove, allowHotSeat, onMove }: GameBoardProps) {
  const preset = getGamePreset(snapshot.presetKey);
  const reconstructed = useMemo(
    () => reconstructBoard(snapshot.presetKey, snapshot.moves),
    [snapshot.moves, snapshot.presetKey],
  );
  const lastMove = snapshot.moves[snapshot.moves.length - 1];
  const winningIndices = useMemo(
    () => new Set(snapshot.winningLine.map((cell) => cell.index)),
    [snapshot.winningLine],
  );
  let callerMayMove = snapshot.status === "active" && snapshot.nextTurnUserId === viewerUserId;
  if (allowHotSeat && snapshot.status === "active") callerMayMove = true;
  const cells = reconstructed.board.flatMap((rowValues, row) => rowValues.map((acceptedMark, column) => {
    let mark = acceptedMark;
    const isOptimistic = Boolean(
      optimisticMove
      && optimisticMove.row === row
      && optimisticMove.column === column
      && !acceptedMark,
    );
    if (isOptimistic && optimisticMove) mark = optimisticMove.mark;
    const disabled = !callerMayMove || Boolean(acceptedMark) || Boolean(optimisticMove) || !onMove;
    return {
      key: `${row}:${column}`,
      row,
      column,
      mark,
      disabled,
      isLast: Boolean(lastMove && lastMove.row === row && lastMove.column === column),
      isWinning: winningIndices.has(cellToIndex(row, column, preset.boardSize)),
      isOptimistic,
    };
  }));
  return { cells, preset, lastMove };
}

function DirectBoard(props: GameBoardProps) {
  const { cells, preset } = useBoardCells(props);
  const cellPercent = `${100 / preset.boardSize}%` as DimensionValue;
  return (
    <View
      accessibilityLabel={`${preset.label} board`}
      style={styles.directBoard}
    >
      {cells.map((cell) => (
        <GameCell
          {...cell}
          key={cell.key}
          size={cellPercent}
          onPress={() => props.onMove?.(cell.row, cell.column)}
          usePressable
        />
      ))}
    </View>
  );
}

function InteractiveLargeBoard(props: GameBoardProps) {
  const { cells, preset, lastMove } = useBoardCells(props);
  const [viewportSize, setViewportSize] = useState(320);
  const boardPixels = preset.boardSize * LARGE_CELL_SIZE;
  const minimumScale = Math.min(1, viewportSize / boardPixels);
  const scale = useSharedValue(minimumScale);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startScale = useSharedValue(minimumScale);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const tapStartRow = useSharedValue(-1);
  const tapStartColumn = useSharedValue(-1);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    scale.value = minimumScale;
    translateX.value = 0;
    translateY.value = 0;
  }, [minimumScale, preset.key, scale, translateX, translateY]);

  const clampTranslation = (value: number, currentScale: number) => {
    "worklet";
    const maximum = Math.max(0, (boardPixels * currentScale - viewportSize) / 2);
    return Math.min(maximum, Math.max(-maximum, value));
  };

  const pan = Gesture.Pan()
    .minDistance(8)
    .onBegin(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = clampTranslation(startX.value + event.translationX, scale.value);
      translateY.value = clampTranslation(startY.value + event.translationY, scale.value);
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      startScale.value = scale.value;
    })
    .onUpdate((event) => {
      const nextScale = Math.min(MAX_SCALE, Math.max(minimumScale, startScale.value * event.scale));
      scale.value = nextScale;
      translateX.value = clampTranslation(translateX.value, nextScale);
      translateY.value = clampTranslation(translateY.value, nextScale);
    });

  const resolveCell = (x: number, y: number) => {
    "worklet";
    const scaledBoard = boardPixels * scale.value;
    const left = (viewportSize - scaledBoard) / 2 + translateX.value;
    const top = (viewportSize - scaledBoard) / 2 + translateY.value;
    const column = Math.floor((x - left) / (LARGE_CELL_SIZE * scale.value));
    const row = Math.floor((y - top) / (LARGE_CELL_SIZE * scale.value));
    return { row, column };
  };

  const submitCell = (row: number, column: number) => {
    const cell = cells.find((item) => item.row === row && item.column === column);
    if (!cell || cell.disabled) return;
    props.onMove?.(row, column);
  };

  const tap = Gesture.Tap()
    .maxDistance(8)
    .onBegin((event) => {
      const cell = resolveCell(event.x, event.y);
      tapStartRow.value = cell.row;
      tapStartColumn.value = cell.column;
    })
    .onEnd((event, success) => {
      if (!success) return;
      const cell = resolveCell(event.x, event.y);
      if (cell.row !== tapStartRow.value || cell.column !== tapStartColumn.value) return;
      runOnJS(submitCell)(cell.row, cell.column);
    });

  const gesture = Gesture.Race(Gesture.Simultaneous(pan, pinch), tap);
  const animatedBoardStyle = useAnimatedStyle(() => {
    const scaledBoard = boardPixels * scale.value;
    return {
      left: (viewportSize - scaledBoard) / 2 + translateX.value,
      top: (viewportSize - scaledBoard) / 2 + translateY.value,
      transform: [{ scale: scale.value }],
    };
  });

  const setTransform = (nextScale: number, nextX: number, nextY: number) => {
    if (reduceMotion) {
      scale.value = nextScale;
      translateX.value = nextX;
      translateY.value = nextY;
      return;
    }
    const config = { duration: 180, reduceMotion: ReduceMotion.System };
    scale.value = withTiming(nextScale, config);
    translateX.value = withTiming(nextX, config);
    translateY.value = withTiming(nextY, config);
  };

  const centerLastMove = () => {
    if (!lastMove) return;
    const nextScale = Math.max(1, minimumScale);
    const scaledBoard = boardPixels * nextScale;
    const cellX = (lastMove.column + 0.5) * LARGE_CELL_SIZE * nextScale;
    const cellY = (lastMove.row + 0.5) * LARGE_CELL_SIZE * nextScale;
    const maximum = Math.max(0, (scaledBoard - viewportSize) / 2);
    const nextX = Math.min(maximum, Math.max(-maximum, scaledBoard / 2 - cellX));
    const nextY = Math.min(maximum, Math.max(-maximum, scaledBoard / 2 - cellY));
    setTransform(nextScale, nextX, nextY);
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const width = Math.max(1, Math.floor(event.nativeEvent.layout.width));
    setViewportSize(width);
  };

  return (
    <View style={styles.largeBoardGroup}>
      <GestureDetector gesture={gesture}>
        <View
          accessibilityLabel={`${preset.label} pannable and zoomable board`}
          onLayout={onLayout}
          style={styles.largeViewport}
        >
          <Animated.View
            style={[
              styles.largeBoard,
              { width: boardPixels, height: boardPixels, transformOrigin: [0, 0, 0] },
              animatedBoardStyle,
            ]}
          >
            {cells.map((cell) => (
              <GameCell
                {...cell}
                key={cell.key}
                size={LARGE_CELL_SIZE}
                onPress={() => submitCell(cell.row, cell.column)}
                usePressable={false}
              />
            ))}
          </Animated.View>
        </View>
      </GestureDetector>
      <View style={styles.boardControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset board zoom"
          onPress={() => setTransform(minimumScale, 0, 0)}
          style={({ pressed }) => [styles.boardControl, pressed && styles.pressedControl]}
        >
          <Text style={styles.boardControlText}>RESET ZOOM</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Center board on last move"
          accessibilityState={{ disabled: !lastMove }}
          disabled={!lastMove}
          onPress={centerLastMove}
          style={({ pressed }) => [styles.boardControl, !lastMove && styles.disabledControl, pressed && styles.pressedControl]}
        >
          <Text style={styles.boardControlText}>CENTER LAST MOVE</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function GameBoard(props: GameBoardProps) {
  const preset = getGamePreset(props.snapshot.presetKey);
  if (preset.boardSize <= 5) return <DirectBoard {...props} />;
  return <InteractiveLargeBoard {...props} />;
}

const styles = StyleSheet.create({
  directBoard: {
    width: "100%",
    maxWidth: 480,
    aspectRatio: 1,
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 2,
    borderColor: lobbyColors.cyan,
    backgroundColor: lobbyColors.background,
  },
  largeBoardGroup: { gap: 12 },
  largeViewport: {
    width: "100%",
    maxWidth: 560,
    aspectRatio: 1,
    alignSelf: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: lobbyColors.cyan,
    backgroundColor: lobbyColors.background,
  },
  largeBoard: { position: "absolute", flexDirection: "row", flexWrap: "wrap" },
  cell: {
    borderWidth: 1,
    borderColor: lobbyColors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: lobbyColors.surfaceRaised,
  },
  mark: { color: lobbyColors.text, fontSize: 28, fontWeight: "900" },
  markX: { color: lobbyColors.cyan },
  markO: { color: lobbyColors.magenta },
  lastCell: { borderWidth: 3, borderColor: lobbyColors.green },
  winningCell: { borderWidth: 4, borderColor: lobbyColors.text, backgroundColor: "#16385A" },
  optimisticCell: { borderStyle: "dashed", borderWidth: 3, borderColor: lobbyColors.magenta, opacity: 0.72 },
  disabledCell: { opacity: 0.88 },
  pressedCell: { opacity: 0.62 },
  cellIndicator: { position: "absolute", bottom: 2, color: lobbyColors.text, fontSize: 7, fontWeight: "900" },
  boardControls: { flexDirection: "row", gap: 10, justifyContent: "center", flexWrap: "wrap" },
  boardControl: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: lobbyColors.border,
    borderRadius: 8,
    backgroundColor: lobbyColors.surfaceRaised,
    paddingHorizontal: 14,
  },
  boardControlText: { color: lobbyColors.cyan, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  pressedControl: { opacity: 0.65 },
  disabledControl: { opacity: 0.4 },
});
