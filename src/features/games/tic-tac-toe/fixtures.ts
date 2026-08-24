import { reconstructBoard } from "@/src/features/games/tic-tac-toe/rules";
import { getGamePreset } from "@/src/features/games/tic-tac-toe/presets";
import type {
  GameCallerRole,
  GameMark,
  GameMove,
  GameParticipant,
  GamePlayer,
  GamePresetKey,
  GameSnapshot,
} from "@/src/features/games/tic-tac-toe/types";

const FIXTURE_TIME = "2026-08-24T12:00:00.000Z";

export type FixtureScenario =
  | "setup"
  | "pending_challenger"
  | "pending_invited"
  | "pending_spectator"
  | "active_player_turn"
  | "active_opponent_turn"
  | "active_spectator"
  | "active_second_spectator"
  | "optimistic"
  | "won"
  | "draw"
  | "resigned"
  | "declined"
  | "cancelled"
  | "closed"
  | "rematch"
  | "unavailable";

export const FIXTURE_SCENARIOS: { key: FixtureScenario; label: string }[] = [
  { key: "setup", label: "Setup" },
  { key: "pending_challenger", label: "Pending: challenger" },
  { key: "pending_invited", label: "Pending: invited" },
  { key: "pending_spectator", label: "Pending: spectator" },
  { key: "active_player_turn", label: "Active: your turn" },
  { key: "active_opponent_turn", label: "Active: opponent turn" },
  { key: "active_spectator", label: "Active: own-duo spectator" },
  { key: "active_second_spectator", label: "Active: opponent-duo spectator" },
  { key: "optimistic", label: "Optimistic move" },
  { key: "won", label: "Won" },
  { key: "draw", label: "Draw" },
  { key: "resigned", label: "Resigned" },
  { key: "declined", label: "Declined" },
  { key: "cancelled", label: "Cancelled" },
  { key: "closed", label: "Closed" },
  { key: "rematch", label: "Rematch request" },
  { key: "unavailable", label: "Unavailable" },
];

export type FixtureState = {
  snapshot: GameSnapshot | null;
  viewerUserId: string;
  optimisticMove: Pick<GameMove, "row" | "column" | "mark"> | null;
  unavailable: boolean;
};

function fixtureUuid(value: number) {
  return `00000000-0000-4000-8000-${value.toString().padStart(12, "0")}`;
}

function gamePlayer(participant: GameParticipant, mark: GameMark): GamePlayer {
  let playerOrder: 1 | 2 = 2;
  if (mark === "X") playerOrder = 1;
  return { ...participant, mark, playerOrder };
}

export function createLocalInvitation(
  conversationId: string,
  presetKey: GamePresetKey,
  challenger: GameParticipant,
  invited: GameParticipant,
  previousGameId: string | null = null,
): GameSnapshot {
  let gameId = fixtureUuid(900);
  if (previousGameId) gameId = fixtureUuid(901);
  return {
    id: gameId,
    conversationId,
    presetKey,
    status: "pending",
    stateVersion: 0,
    challenger,
    invited,
    players: [],
    moves: [],
    nextTurnUserId: null,
    winnerUserId: null,
    winningLine: [],
    previousGameId,
    createdAt: FIXTURE_TIME,
    updatedAt: FIXTURE_TIME,
  };
}

export function acceptLocalInvitation(
  snapshot: GameSnapshot,
  xParticipant: GameParticipant = snapshot.challenger,
  oParticipant: GameParticipant = snapshot.invited,
): GameSnapshot {
  const players = [gamePlayer(xParticipant, "X"), gamePlayer(oParticipant, "O")];
  return {
    ...snapshot,
    status: "active",
    stateVersion: snapshot.stateVersion + 1,
    players,
    nextTurnUserId: xParticipant.userId,
    updatedAt: new Date().toISOString(),
  };
}

export function submitLocalMove(snapshot: GameSnapshot, row: number, column: number): GameSnapshot {
  if (snapshot.status !== "active" || !snapshot.nextTurnUserId) {
    throw new Error("This local game is not accepting moves.");
  }
  const player = snapshot.players.find((item) => item.userId === snapshot.nextTurnUserId);
  if (!player) throw new Error("The next local player is unavailable.");
  const move: GameMove = {
    id: fixtureUuid(1000 + snapshot.moves.length),
    moveNumber: snapshot.moves.length + 1,
    row,
    column,
    mark: player.mark,
    userId: player.userId,
    createdAt: new Date().toISOString(),
  };
  const moves = [...snapshot.moves, move];
  const result = reconstructBoard(snapshot.presetKey, moves);
  const otherPlayer = snapshot.players.find((item) => item.userId !== player.userId);
  let status: GameSnapshot["status"] = "active";
  let nextTurnUserId: string | null = otherPlayer?.userId ?? null;
  let winnerUserId: string | null = null;
  if (result.winner) {
    status = "won";
    nextTurnUserId = null;
    winnerUserId = player.userId;
  } else if (result.isDraw) {
    status = "draw";
    nextTurnUserId = null;
  }
  return {
    ...snapshot,
    status,
    stateVersion: snapshot.stateVersion + 1,
    moves,
    nextTurnUserId,
    winnerUserId,
    winningLine: result.winningLine,
    updatedAt: new Date().toISOString(),
  };
}

export function getCallerRole(snapshot: GameSnapshot, userId: string): GameCallerRole {
  const player = snapshot.players.find((item) => item.userId === userId);
  if (player?.mark === "X") return "player_x";
  if (player?.mark === "O") return "player_o";
  if (snapshot.status === "pending" && snapshot.challenger.userId === userId) return "challenger";
  if (snapshot.status === "pending" && snapshot.invited.userId === userId) return "invited";
  return "spectator";
}

function createActiveFixture(
  conversationId: string,
  presetKey: GamePresetKey,
  participants: GameParticipant[],
  moves: [number, number][],
): GameSnapshot {
  const pending = createLocalInvitation(conversationId, presetKey, participants[0], participants[2]);
  const accepted = acceptLocalInvitation(pending);
  return moves.reduce(
    (snapshot, [row, column]) => submitLocalMove(snapshot, row, column),
    accepted,
  );
}

export function createFixtureState(
  scenario: FixtureScenario,
  conversationId: string,
  presetKey: GamePresetKey,
  participants: GameParticipant[],
): FixtureState {
  if (participants.length !== 4) throw new Error("The game preview requires four participants.");
  if (scenario === "setup" || scenario === "unavailable") {
    return {
      snapshot: null,
      viewerUserId: participants[0].userId,
      optimisticMove: null,
      unavailable: scenario === "unavailable",
    };
  }

  if (scenario.startsWith("pending") || scenario === "declined" || scenario === "cancelled" || scenario === "closed" || scenario === "rematch") {
    let previousGameId: string | null = null;
    if (scenario === "rematch") previousGameId = fixtureUuid(800);
    let snapshot = createLocalInvitation(
      conversationId,
      presetKey,
      participants[0],
      participants[2],
      previousGameId,
    );
    if (scenario === "declined" || scenario === "cancelled" || scenario === "closed") {
      snapshot = { ...snapshot, status: scenario, stateVersion: 1 };
    }
    let viewerUserId = participants[0].userId;
    if (scenario === "pending_invited" || scenario === "rematch") viewerUserId = participants[2].userId;
    if (scenario === "pending_spectator") viewerUserId = participants[1].userId;
    return { snapshot, viewerUserId, optimisticMove: null, unavailable: false };
  }

  if (scenario === "draw") {
    const drawMoves: [number, number][] = [
      [0, 0], [0, 1], [0, 2], [1, 1], [1, 0], [1, 2], [2, 1], [2, 0], [2, 2],
    ];
    return {
      snapshot: createActiveFixture(conversationId, "classic", participants, drawMoves),
      viewerUserId: participants[0].userId,
      optimisticMove: null,
      unavailable: false,
    };
  }

  let baseMoves: [number, number][] = [[0, 0]];
  if (scenario === "won") {
    baseMoves = [];
    const { winLength } = getGamePreset(presetKey);
    for (let column = 0; column < winLength; column += 1) {
      baseMoves.push([0, column]);
      if (column < winLength - 1) baseMoves.push([1, column]);
    }
  }
  let snapshot = createActiveFixture(conversationId, presetKey, participants, baseMoves);
  let viewerUserId = participants[0].userId;
  let optimisticMove: FixtureState["optimisticMove"] = null;
  if (scenario === "active_player_turn") {
    snapshot = createActiveFixture(conversationId, presetKey, participants, [[0, 0], [1, 1]]);
  }
  if (scenario === "active_spectator") viewerUserId = participants[1].userId;
  if (scenario === "active_second_spectator") viewerUserId = participants[3].userId;
  if (scenario === "optimistic") optimisticMove = { row: 1, column: 1, mark: "O" };
  if (scenario === "resigned") {
    const winner = snapshot.players.find((item) => item.userId !== snapshot.nextTurnUserId);
    snapshot = {
      ...snapshot,
      status: "resigned",
      nextTurnUserId: null,
      winnerUserId: winner?.userId ?? null,
      stateVersion: snapshot.stateVersion + 1,
    };
  }
  return { snapshot, viewerUserId, optimisticMove, unavailable: false };
}
