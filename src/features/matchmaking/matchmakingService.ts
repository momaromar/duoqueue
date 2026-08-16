import { missingPublicEnv } from "@/src/lib/env";
import { supabase } from "@/src/lib/supabase";
import {
  matchmakingStateSchema,
  type MatchmakingState,
  type MatchmakingStateWithImages,
} from "@/src/features/matchmaking/schemas";

const PROFILE_IMAGE_BUCKET = "duo-profile-images";
let matchmakingChannelSequence = 0;

function requireSupabase() {
  if (!supabase) {
    throw new Error(`Missing Supabase configuration: ${missingPublicEnv.join(", ")}`);
  }
  return supabase;
}

async function addOpponentImageUrls(state: MatchmakingState) {
  if (!state.match) return { ...state, match: null } satisfies MatchmakingStateWithImages;

  const client = requireSupabase();
  const members = await Promise.all(state.match.opponent.members.map(async (member) => {
    let imageUrl: string | null = null;
    if (member.imagePath) {
      const { data, error } = await client.storage
        .from(PROFILE_IMAGE_BUCKET)
        .createSignedUrl(member.imagePath, 60 * 60);
      if (!error) imageUrl = data.signedUrl;
    }
    return { ...member, imageUrl };
  }));

  return {
    ...state,
    match: {
      ...state.match,
      opponent: { ...state.match.opponent, members },
    },
  } satisfies MatchmakingStateWithImages;
}

async function parseState(data: unknown) {
  const state = matchmakingStateSchema.parse(data);
  if (state.status === "matched" && !state.match) {
    return addOpponentImageUrls({
      ...state,
      status: "idle",
      ticket: null,
      readiness: {
        canQueue: Boolean(state.duo?.profileComplete && state.duo.memberCount === 2),
        reason: "The previous match is closed. This duo may queue again.",
      },
    });
  }
  return addOpponentImageUrls(state);
}

export async function getMatchmakingState() {
  const { data, error } = await requireSupabase().rpc("get_my_matchmaking_state");
  if (error) throw error;
  return parseState(data);
}

export async function enterMatchmaking() {
  const { data, error } = await requireSupabase().rpc("enter_matchmaking");
  if (error) throw error;
  return parseState(data);
}

export async function cancelMatchmakingTicket() {
  const { data, error } = await requireSupabase().rpc("cancel_my_matchmaking_ticket");
  if (error) throw error;
  return parseState(data);
}

export async function tryMatchDuo() {
  const { data, error } = await requireSupabase().rpc("try_match_my_duo");
  if (error) throw error;
  return parseState(data);
}

export function subscribeToMatchmakingTicket(duoId: string, onChange: () => void, matchId?: string) {
  const client = requireSupabase();
  matchmakingChannelSequence += 1;
  const ticketChannel = client
    .channel(`matchmaking-ticket:${duoId}:${matchmakingChannelSequence}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "matchmaking_tickets",
        filter: `duo_id=eq.${duoId}`,
      },
      onChange,
    )
    .subscribe();

  const channels = [ticketChannel];
  if (matchId) {
    const matchChannel = client
      .channel(`matchmaking-match:${matchId}:${matchmakingChannelSequence}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchId}` },
        onChange,
      )
      .subscribe();
    channels.push(matchChannel);
  }

  return () => {
    channels.forEach((channel) => { void client.removeChannel(channel); });
  };
}
