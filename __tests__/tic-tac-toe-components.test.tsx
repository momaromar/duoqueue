import { cleanup, fireEvent, render } from "@testing-library/react-native";

import { GameBoard } from "@/src/features/games/tic-tac-toe/components/GameBoard";
import { GameConnectionNotice } from "@/src/features/games/tic-tac-toe/components/GameConnectionNotice";
import { GameResignationConfirmation } from "@/src/features/games/tic-tac-toe/components/GameResignationConfirmation";
import { GameSetupPanel } from "@/src/features/games/tic-tac-toe/components/GameSetupPanel";
import { GameStatusPanel } from "@/src/features/games/tic-tac-toe/components/GameStatusPanel";
import { createFixtureState } from "@/src/features/games/tic-tac-toe/fixtures";
import { gameSnapshotSchema } from "@/src/features/games/tic-tac-toe/schemas";
import type { GameParticipant, GamePresetKey } from "@/src/features/games/tic-tac-toe/types";

const conversationId = "20000000-0000-4000-8000-000000000001";
const participants: GameParticipant[] = [
  { userId: "20000000-0000-4000-8000-000000000011", displayName: "Avery", duoId: "20000000-0000-4000-8000-000000000021", duoName: "Neon North" },
  { userId: "20000000-0000-4000-8000-000000000012", displayName: "Blair", duoId: "20000000-0000-4000-8000-000000000021", duoName: "Neon North" },
  { userId: "20000000-0000-4000-8000-000000000013", displayName: "Casey", duoId: "20000000-0000-4000-8000-000000000022", duoName: "Pixel Pair" },
  { userId: "20000000-0000-4000-8000-000000000014", displayName: "Devon", duoId: "20000000-0000-4000-8000-000000000022", duoName: "Pixel Pair" },
];

afterEach(async () => {
  await cleanup();
});

describe("Tic-Tac-Toe setup", () => {
  it("offers every fixed preset without choosing an opponent", async () => {
    const selectPreset = jest.fn();
    const createInvitation = jest.fn();
    const view = await render(
      <GameSetupPanel
        selectedPreset="classic"
        onSelectPreset={selectPreset}
        onCreateInvitation={createInvitation}
      />,
    );

    expect(view.getByLabelText("Classic 3 × 3")).toBeTruthy();
    expect(view.getByLabelText("Quick 5 × 5")).toBeTruthy();
    expect(view.getByLabelText("Extended 7 × 7")).toBeTruthy();
    expect(view.getByLabelText("Large 10 × 10")).toBeTruthy();
    await fireEvent.press(view.getByLabelText("Large 10 × 10"));
    expect(view.queryByText("OPPONENT")).toBeNull();
    await fireEvent.press(view.getByLabelText("Post open game invitation"));
    expect(selectPreset).toHaveBeenCalledWith("large");
    expect(createInvitation).toHaveBeenCalledTimes(1);
  });
});

describe("Tic-Tac-Toe game states", () => {
  it.each([
    ["classic", 9],
    ["quick", 25],
    ["extended", 49],
    ["large", 100],
  ] as [GamePresetKey, number][])("renders every cell for the %s preset", async (presetKey, cellCount) => {
    const fixture = createFixtureState("active_player_turn", conversationId, presetKey, participants);
    if (!fixture.snapshot) throw new Error("Expected an active fixture.");
    const view = await render(
      <GameBoard
        snapshot={fixture.snapshot}
        viewerUserId={fixture.viewerUserId}
        onMove={jest.fn()}
      />,
    );
    expect(view.getAllByLabelText(/^Row \d+, column \d+,/)).toHaveLength(cellCount);
  });

  it.each([
    ["pending_challenger", "VIEWER ROLE: CHALLENGER"],
    ["pending_invited", "VIEWER ROLE: INVITED"],
    ["pending_spectator", "VIEWER ROLE: SPECTATOR"],
    ["active_player_turn", "VIEWER ROLE: PLAYER X"],
    ["active_spectator", "VIEWER ROLE: SPECTATOR"],
    ["active_second_spectator", "VIEWER ROLE: SPECTATOR"],
    ["won", "Avery won"],
    ["draw", "Draw"],
    ["resigned", "Avery won by resignation"],
    ["declined", "Invitation declined"],
    ["cancelled", "Invitation cancelled"],
    ["closed", "Game unavailable"],
    ["rematch", "Rematch requested"],
  ] as const)("renders the %s fixture", async (scenario, expectedText) => {
    const fixture = createFixtureState(scenario, conversationId, "classic", participants);
    expect(fixture.snapshot).not.toBeNull();
    if (!fixture.snapshot) return;
    expect(gameSnapshotSchema.parse(fixture.snapshot)).toBeTruthy();
    const view = await render(
      <GameStatusPanel
        snapshot={fixture.snapshot}
        viewerUserId={fixture.viewerUserId}
        localHotSeat={false}
      />,
    );
    expect(view.getByText(expectedText)).toBeTruthy();
  });

  it("renders nine accessible cells and disables a spectator", async () => {
    const fixture = createFixtureState("active_spectator", conversationId, "classic", participants);
    if (!fixture.snapshot) throw new Error("Expected an active fixture.");
    const onMove = jest.fn();
    const view = await render(
      <GameBoard
        snapshot={fixture.snapshot}
        viewerUserId={fixture.viewerUserId}
        onMove={onMove}
      />,
    );
    const cells = view.getAllByRole("button");
    expect(cells).toHaveLength(9);
    const emptyCell = view.getByLabelText(/^Row 1, column 2, empty,/);
    expect(emptyCell.props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(emptyCell);
    expect(onMove).not.toHaveBeenCalled();
  });

  it("exposes eligible cells for the active player and displays an optimistic mark separately", async () => {
    const fixture = createFixtureState("optimistic", conversationId, "classic", participants);
    if (!fixture.snapshot) throw new Error("Expected an optimistic fixture.");
    const view = await render(
      <GameBoard
        snapshot={fixture.snapshot}
        viewerUserId={fixture.viewerUserId}
        optimisticMove={fixture.optimisticMove}
        onMove={jest.fn()}
      />,
    );
    expect(view.getByText("PENDING")).toBeTruthy();
    expect(view.getByLabelText(/^Row 2, column 2, occupied by O,/)).toBeTruthy();
  });

  it("requires explicit confirmation before resignation", async () => {
    const confirm = jest.fn();
    const cancel = jest.fn();
    const view = await render(
      <GameResignationConfirmation opponentName="Casey" onConfirm={confirm} onCancel={cancel} />,
    );
    expect(view.getByText("Casey will immediately win. Accepted moves remain in the game record.")).toBeTruthy();
    await fireEvent.press(view.getByLabelText("CONFIRM RESIGNATION"));
    await fireEvent.press(view.getByLabelText("KEEP PLAYING"));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it("keeps a resigned board read-only while exposing rematch only when supplied", async () => {
    const fixture = createFixtureState("resigned", conversationId, "classic", participants);
    if (!fixture.snapshot) throw new Error("Expected a resigned fixture.");
    const rematch = jest.fn();
    const statusView = await render(
      <GameStatusPanel
        snapshot={fixture.snapshot}
        viewerUserId={fixture.viewerUserId}
        callerRole="player_o"
        localHotSeat={false}
        onRematch={rematch}
      />,
    );
    await fireEvent.press(statusView.getByLabelText("REQUEST REMATCH"));
    expect(rematch).toHaveBeenCalledTimes(1);
    await cleanup();

    const boardView = await render(
      <GameBoard snapshot={fixture.snapshot} viewerUserId={fixture.viewerUserId} />,
    );
    expect(boardView.getAllByRole("button").every((cell) => cell.props.accessibilityState.disabled)).toBe(true);
  });

  it("keeps live-update failures recoverable without hiding the board state", async () => {
    const reconnect = jest.fn();
    const view = await render(
      <GameConnectionNotice status="channel_error" isRecovering={false} onReconnect={reconnect} />,
    );
    expect(view.getByText("Live updates interrupted")).toBeTruthy();
    await fireEvent.press(view.getByLabelText("Reconnect and refresh game"));
    expect(reconnect).toHaveBeenCalledTimes(1);
  });

  it("describes availability and overlapping indicators without relying on color", async () => {
    const fixture = createFixtureState("won", conversationId, "classic", participants);
    if (!fixture.snapshot) throw new Error("Expected a winning fixture.");
    const view = await render(
      <GameBoard snapshot={fixture.snapshot} viewerUserId={fixture.viewerUserId} />,
    );
    expect(view.getByLabelText(/last move, winning cell/)).toBeTruthy();
    expect(view.getByText("LAST · WIN")).toBeTruthy();
  });
});
