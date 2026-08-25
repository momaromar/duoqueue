import { missingPublicEnv } from "@/src/lib/env";
import { supabase } from "@/src/lib/supabase";
import { conversationGameSchema } from "@/src/features/games/tic-tac-toe/schemas";
import type { GamePresetKey } from "@/src/features/games/tic-tac-toe/types";

let gameChannelSequence = 0;

function requireSupabase() {
  if (!supabase) {
    throw new Error(`Missing Supabase configuration: ${missingPublicEnv.join(", ")}`);
  }
  return supabase;
}

function parseGame(data: unknown) {
  return conversationGameSchema.parse(data);
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
  invitedUserId: string,
) {
  const { data, error } = await requireSupabase().rpc("create_game_invitation", {
    conversation_id: conversationId,
    client_game_id: gameId,
    preset_key: presetKey,
    invited_user_id: invitedUserId,
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

export function subscribeToConversationGame(
  conversationId: string,
  gameId: string | undefined,
  onChange: () => void,
) {
  const client = requireSupabase();
  gameChannelSequence += 1;
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
    .subscribe();

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
      .subscribe();
    channels.push(movesChannel);
  }

  return () => {
    channels.forEach((channel) => { void client.removeChannel(channel); });
  };
}

export function getGameErrorMessage(error: unknown) {
  let raw = String(error ?? "");
  if (error instanceof Error) raw = error.message;
  if (/GAME_VERSION_CONFLICT/i.test(raw)) {
    return "The game changed on another device. The latest state has been loaded.";
  }
  if (/GAME_LIVE_EXISTS|unique constraint|duplicate key/i.test(raw)) {
    return "This conversation already has a pending or active game. Refresh to view it.";
  }
  if (/GAME_NOT_AUTHORIZED|permission denied|not an active conversation member/i.test(raw)) {
    return "You are not allowed to perform that game action.";
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
  if (/column reference .* is ambiguous/i.test(raw)) {
    return "The invitation RPC needs the Milestone 2 repair migration. Apply 202608240002, then refresh.";
  }
  if (/submit_game_move.*does not exist|could not find.*submit_game_move/i.test(raw)) {
    return "Authoritative moves are not configured yet. Apply the Milestone 3 migration, then refresh.";
  }
  if (/function .* does not exist|schema cache|game_sessions.*does not exist/i.test(raw)) {
    return "Tic-Tac-Toe invitations are not configured yet. Apply the Milestone 2 Supabase migration, then retry.";
  }
  if (/network|fetch|offline/i.test(raw)) {
    return "The game service could not be reached. Check your connection and retry.";
  }
  return raw || "The game action could not be completed. Please retry.";
}
