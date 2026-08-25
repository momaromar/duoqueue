import { missingPublicEnv } from "@/src/lib/env";
import { supabase } from "@/src/lib/supabase";
import { conversationGameSchema } from "@/src/features/games/tic-tac-toe/schemas";
import type { GamePresetKey } from "@/src/features/games/tic-tac-toe/types";

let gameChannelSequence = 0;

export type GameRealtimeConnectionStatus =
  | "connecting"
  | "subscribed"
  | "disconnected"
  | "timed_out"
  | "channel_error";

function requireSupabase() {
  if (!supabase) {
    throw new Error(`Missing Supabase configuration: ${missingPublicEnv.join(", ")}`);
  }
  return supabase;
}

function parseGame(data: unknown) {
  return conversationGameSchema.parse(data);
}

function getRawGameError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return String(error ?? "");
}

export async function getConversationGame(conversationId: string) {
  const { data, error } = await requireSupabase().rpc("get_conversation_game", {
    conversation_id: conversationId,
  });
  if (error) throw error;
  return parseGame(data);
}

export async function createGameInvitation(
  conversationId: string,
  gameId: string,
  presetKey: GamePresetKey,
) {
  const { data, error } = await requireSupabase().rpc("create_game_invitation", {
    conversation_id: conversationId,
    client_game_id: gameId,
    preset_key: presetKey,
  });
  if (error) throw error;
  return parseGame(data);
}

async function transitionInvitation(
  operation: "accept_game_invitation" | "decline_game_invitation" | "cancel_game_invitation",
  gameId: string,
  expectedStateVersion: number,
) {
  const { data, error } = await requireSupabase().rpc(operation, {
    game_id: gameId,
    expected_state_version: expectedStateVersion,
  });
  if (error) throw error;
  return parseGame(data);
}

export function acceptGameInvitation(gameId: string, expectedStateVersion: number) {
  return transitionInvitation("accept_game_invitation", gameId, expectedStateVersion);
}

export function declineGameInvitation(gameId: string, expectedStateVersion: number) {
  return transitionInvitation("decline_game_invitation", gameId, expectedStateVersion);
}

export function cancelGameInvitation(gameId: string, expectedStateVersion: number) {
  return transitionInvitation("cancel_game_invitation", gameId, expectedStateVersion);
}

export async function submitGameMove(
  gameId: string,
  moveId: string,
  expectedStateVersion: number,
  row: number,
  column: number,
) {
  const { data, error } = await requireSupabase().rpc("submit_game_move", {
    game_id: gameId,
    client_move_id: moveId,
    expected_state_version: expectedStateVersion,
    row_index: row,
    column_index: column,
  });
  if (error) throw error;
  return parseGame(data);
}

export async function resignGame(gameId: string, expectedStateVersion: number) {
  const { data, error } = await requireSupabase().rpc("resign_game", {
    game_id: gameId,
    expected_state_version: expectedStateVersion,
  });
  if (error) throw error;
  return parseGame(data);
}

export async function createGameRematch(
  previousGameId: string,
  gameId: string,
  expectedStateVersion: number,
) {
  const { data, error } = await requireSupabase().rpc("create_game_rematch", {
    previous_game_id: previousGameId,
    client_game_id: gameId,
    expected_state_version: expectedStateVersion,
  });
  if (error) throw error;
  return parseGame(data);
}

export function subscribeToConversationGame(
  conversationId: string,
  gameId: string | undefined,
  onChange: () => void,
  onStatus?: (status: GameRealtimeConnectionStatus) => void,
) {
  const client = requireSupabase();
  gameChannelSequence += 1;
  let disposed = false;
  let expectedChannels = 1;
  if (gameId) expectedChannels = 2;
  const subscribedChannels = new Set<string>();
  const handleStatus = (channelName: string, status: string) => {
    if (disposed) return;
    if (status === "SUBSCRIBED") {
      subscribedChannels.add(channelName);
      if (subscribedChannels.size === expectedChannels) onStatus?.("subscribed");
      return;
    }
    subscribedChannels.delete(channelName);
    if (status === "TIMED_OUT") onStatus?.("timed_out");
    else if (status === "CHANNEL_ERROR") onStatus?.("channel_error");
    else if (status === "CLOSED") onStatus?.("disconnected");
  };
  onStatus?.("connecting");
  const sessionChannel = client
    .channel(`conversation-game:${conversationId}:${gameChannelSequence}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "game_sessions",
        filter: `conversation_id=eq.${conversationId}`,
      },
      onChange,
    )
    .subscribe((status) => handleStatus("session", status));

  const channels = [sessionChannel];
  if (gameId) {
    const movesChannel = client
      .channel(`game-moves:${gameId}:${gameChannelSequence}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_moves",
          filter: `game_id=eq.${gameId}`,
        },
        onChange,
      )
      .subscribe((status) => handleStatus("moves", status));
    channels.push(movesChannel);
  }

  return () => {
    disposed = true;
    channels.forEach((channel) => { void client.removeChannel(channel); });
  };
}

export function isGameConversationUnavailableError(error: unknown) {
  const raw = getRawGameError(error);
  return /GAME_NOT_AUTHORIZED.*(conversation|active)|conversation.*(closed|unavailable)|This conversation is closed/i.test(raw);
}

export function getGameErrorMessage(error: unknown) {
  const raw = getRawGameError(error);
  if (/GAME_VERSION_CONFLICT/i.test(raw)) {
    return "The game changed on another device. The latest state has been loaded.";
  }
  if (/GAME_LIVE_EXISTS|unique constraint|duplicate key/i.test(raw)) {
    return "This conversation already has a pending or active game. Refresh to view it.";
  }
  if (/GAME_NOT_AUTHORIZED|permission denied|not an active conversation member/i.test(raw)) {
    return "You are not allowed to perform that game action.";
  }
  if (/GAME_OPEN_INVITATION_SAME_DUO/i.test(raw)) {
    return "Only a member of the other duo can join this invitation.";
  }
  if (/GAME_OPEN_INVITATION_CANNOT_DECLINE/i.test(raw)) {
    return "Open invitations are ignored rather than declined.";
  }
  if (/GAME_NOT_YOUR_TURN/i.test(raw)) {
    return "It is not your turn. The latest board has been loaded.";
  }
  if (/GAME_CELL_OCCUPIED/i.test(raw)) {
    return "That cell is already occupied. The latest board has been loaded.";
  }
  if (/GAME_MOVE_OUT_OF_RANGE/i.test(raw)) {
    return "That cell is outside this board.";
  }
  if (/GAME_NOT_ACTIVE/i.test(raw)) {
    return "This game is no longer accepting moves.";
  }
  if (/GAME_MOVE_IDEMPOTENCY_MISMATCH/i.test(raw)) {
    return "That move retry did not match the original move. The board has been refreshed.";
  }
  if (/GAME_REMATCH_NOT_ALLOWED|GAME_REMATCH_PLAYERS_INVALID/i.test(raw)) {
    return "This game is not eligible for a rematch.";
  }
  if (/GAME_RESIGN_NOT_ALLOWED/i.test(raw)) {
    return "This game can no longer be resigned.";
  }
  if (/column reference .* is ambiguous/i.test(raw)) {
    return "The invitation RPC needs the Milestone 2 repair migration. Apply 202608240002, then refresh.";
  }
  if (/submit_game_move.*does not exist|could not find.*submit_game_move/i.test(raw)) {
    return "Authoritative moves are not configured yet. Apply the Milestone 3 migration, then refresh.";
  }
  if (/resign_game.*does not exist|create_game_rematch.*does not exist|could not find.*(resign_game|create_game_rematch)/i.test(raw)) {
    return "Game lifecycle actions are not configured yet. Apply the Milestone 4 migration, then refresh.";
  }
  if (/create_game_invitation.*invited_user_id|could not find.*create_game_invitation.*preset_key/i.test(raw)) {
    return "Open game invitations are not configured yet. Apply the Milestone 6 migration, then refresh.";
  }
  if (/function .* does not exist|schema cache|game_sessions.*does not exist/i.test(raw)) {
    return "Tic-Tac-Toe invitations are not configured yet. Apply the Milestone 2 Supabase migration, then retry.";
  }
  if (/network|fetch|offline/i.test(raw)) {
    return "The game service could not be reached. Check your connection and retry.";
  }
  return raw || "The game action could not be completed. Please retry.";
}
