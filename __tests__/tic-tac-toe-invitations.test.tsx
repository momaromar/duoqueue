import { QueryClient } from "@tanstack/react-query";
import { cleanup, fireEvent, render } from "@testing-library/react-native";

import { GameBoard } from "@/src/features/games/tic-tac-toe/components/GameBoard";
import { GameStatusPanel } from "@/src/features/games/tic-tac-toe/components/GameStatusPanel";
import { createFixtureState } from "@/src/features/games/tic-tac-toe/fixtures";
import { getGameErrorMessage } from "@/src/features/games/tic-tac-toe/gameService";
import { conversationGameSchema, type ConversationGame } from "@/src/features/games/tic-tac-toe/schemas";
import type { GameParticipant } from "@/src/features/games/tic-tac-toe/types";
import {
  conversationGameKey,
  replaceConversationGameCache,
} from "@/src/features/games/tic-tac-toe/useConversationGame";

jest.mock("@/src/lib/supabase", () => ({ supabase: null }));

const conversationId = "30000000-0000-4000-8000-000000000001";
const userId = "30000000-0000-4000-8000-000000000011";
const participants: GameParticipant[] = [
  { userId, displayName: "Avery", duoId: "30000000-0000-4000-8000-000000000021", duoName: "Neon North" },
  { userId: "30000000-0000-4000-8000-000000000012", displayName: "Blair", duoId: "30000000-0000-4000-8000-000000000021", duoName: "Neon North" },
  { userId: "30000000-0000-4000-8000-000000000013", displayName: "Casey", duoId: "30000000-0000-4000-8000-000000000022", duoName: "Pixel Pair" },
  { userId: "30000000-0000-4000-8000-000000000014", displayName: "Devon", duoId: "30000000-0000-4000-8000-000000000022", duoName: "Pixel Pair" },
];

afterEach(async () => cleanup());

function responseFor(scenario: "pending_challenger" | "pending_invited" | "pending_spectator" | "active_player_turn") {
  const fixture = createFixtureState(scenario, conversationId, "classic", participants);
  if (!fixture.snapshot) throw new Error("Expected a game fixture.");
  let callerRole: ConversationGame["callerRole"] = "spectator";
  if (scenario === "pending_challenger") callerRole = "challenger";
  if (scenario === "pending_invited") callerRole = "invited";
  if (scenario === "active_player_turn") callerRole = "player_x";
  return conversationGameSchema.parse({ game: fixture.snapshot, callerRole });
}

describe("authoritative invitation responses", () => {
  it("accepts an empty state and rejects a game without a caller role", () => {
    expect(conversationGameSchema.parse({ game: null, callerRole: null })).toEqual({ game: null, callerRole: null });
    expect(() => conversationGameSchema.parse({ game: responseFor("pending_challenger").game, callerRole: null })).toThrow();
  });

  it("replaces the user-and-conversation-scoped query cache", () => {
    const queryClient = new QueryClient();
    const response = responseFor("pending_challenger");
    replaceConversationGameCache(queryClient, userId, conversationId, response);
    expect(queryClient.getQueryData(conversationGameKey(userId, conversationId))).toEqual(response);
    expect(queryClient.getQueryData(conversationGameKey(participants[1].userId, conversationId))).toBeUndefined();
    queryClient.clear();
  });

  it("turns conflicts and missing migrations into recoverable copy", () => {
    expect(getGameErrorMessage(new Error("GAME_VERSION_CONFLICT current_version=2"))).toContain("latest state");
    expect(getGameErrorMessage(new Error("function public.get_conversation_game does not exist"))).toContain("migration");
    expect(getGameErrorMessage(new Error("column reference conversation_id is ambiguous"))).toContain("202608240002");
    expect(getGameErrorMessage(new Error("GAME_NOT_YOUR_TURN"))).toContain("not your turn");
    expect(getGameErrorMessage(new Error("GAME_CELL_OCCUPIED"))).toContain("already occupied");
    expect(getGameErrorMessage(new Error("GAME_MOVE_OUT_OF_RANGE"))).toContain("outside");
    expect(getGameErrorMessage(new Error("function public.submit_game_move does not exist"))).toContain("Milestone 3");
    expect(getGameErrorMessage(new Error("function public.resign_game does not exist"))).toContain("Milestone 4");
    expect(getGameErrorMessage(new Error("GAME_REMATCH_NOT_ALLOWED"))).toContain("not eligible");
  });
});

describe("authoritative invitation controls", () => {
  it("shows cancel only to the challenger", async () => {
    const state = responseFor("pending_challenger");
    const cancel = jest.fn();
    const view = await render(
      <GameStatusPanel snapshot={state.game!} viewerUserId={userId} callerRole="challenger" localHotSeat={false} onCancel={cancel} />,
    );
    expect(view.getByLabelText("CANCEL INVITE")).toBeTruthy();
    expect(view.queryByLabelText("ACCEPT INVITE")).toBeNull();
    await fireEvent.press(view.getByLabelText("CANCEL INVITE"));
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it("shows accept and decline only to the invited user", async () => {
    const state = responseFor("pending_invited");
    const accept = jest.fn();
    const decline = jest.fn();
    const view = await render(
      <GameStatusPanel snapshot={state.game!} viewerUserId={participants[2].userId} callerRole="invited" localHotSeat={false} onAccept={accept} onDecline={decline} />,
    );
    await fireEvent.press(view.getByLabelText("ACCEPT INVITE"));
    await fireEvent.press(view.getByLabelText("DECLINE"));
    expect(accept).toHaveBeenCalledTimes(1);
    expect(decline).toHaveBeenCalledTimes(1);
    expect(view.queryByLabelText("CANCEL INVITE")).toBeNull();
  });

  it("leaves spectator invitations actionless and accepted boards read-only", async () => {
    const pending = responseFor("pending_spectator");
    const pendingView = await render(
      <GameStatusPanel snapshot={pending.game!} viewerUserId={participants[1].userId} callerRole="spectator" localHotSeat={false} />,
    );
    expect(pendingView.queryAllByRole("button")).toHaveLength(0);
    await cleanup();

    const accepted = responseFor("active_player_turn");
    const boardView = await render(<GameBoard snapshot={accepted.game!} viewerUserId={userId} />);
    expect(boardView.getAllByRole("button")).toHaveLength(9);
    expect(boardView.getAllByRole("button").every((cell) => cell.props.accessibilityState.disabled)).toBe(true);
  });

  it("enables only an active player's empty cells and locks the board during an optimistic move", async () => {
    const accepted = responseFor("active_player_turn");
    const onMove = jest.fn();
    const activeView = await render(
      <GameBoard snapshot={accepted.game!} viewerUserId={userId} onMove={onMove} />,
    );
    const emptyCell = activeView.getByLabelText(/^Row 1, column 2, empty,/);
    expect(emptyCell.props.accessibilityState.disabled).toBe(false);
    await fireEvent.press(emptyCell);
    expect(onMove).toHaveBeenCalledWith(0, 1);
    await cleanup();

    const pendingView = await render(
      <GameBoard
        snapshot={accepted.game!}
        viewerUserId={userId}
        optimisticMove={{ row: 0, column: 1, mark: "X" }}
        onMove={onMove}
      />,
    );
    expect(pendingView.getByText("PENDING")).toBeTruthy();
    expect(pendingView.getAllByRole("button").every((cell) => cell.props.accessibilityState.disabled)).toBe(true);
  });

  it("renders persisted winning cells and a read-only completed board", async () => {
    const fixture = createFixtureState("won", conversationId, "classic", participants);
    if (!fixture.snapshot) throw new Error("Expected a winning game.");
    const view = await render(<GameBoard snapshot={fixture.snapshot} viewerUserId={userId} />);
    expect(view.getAllByLabelText(/winning cell/)).toHaveLength(3);
    expect(view.getAllByRole("button").every((cell) => cell.props.accessibilityState.disabled)).toBe(true);
  });

  it("shows resignation only when supplied for an assigned active player", async () => {
    const accepted = responseFor("active_player_turn");
    const resign = jest.fn();
    const playerView = await render(
      <GameStatusPanel
        snapshot={accepted.game!}
        viewerUserId={userId}
        callerRole="player_x"
        localHotSeat={false}
        onResign={resign}
      />,
    );
    await fireEvent.press(playerView.getByLabelText("RESIGN GAME"));
    expect(resign).toHaveBeenCalledTimes(1);
    await cleanup();

    const spectatorView = await render(
      <GameStatusPanel
        snapshot={accepted.game!}
        viewerUserId={participants[1].userId}
        callerRole="spectator"
        localHotSeat={false}
      />,
    );
    expect(spectatorView.queryByLabelText("RESIGN GAME")).toBeNull();
  });
});
