import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  getMatchmakingState,
  subscribeToMatchmakingTicket,
} from "@/src/features/matchmaking/matchmakingService";

export function matchmakingStateKey(userId: string | undefined) {
  return ["matchmaking", "current", userId] as const;
}

export function useMatchmakingState(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: matchmakingStateKey(userId),
    queryFn: getMatchmakingState,
    enabled: Boolean(userId) && enabled,
  });
}

export function useMatchmakingRealtime(duoId: string | undefined, userId: string | undefined, matchId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!duoId || !userId) return;
    return subscribeToMatchmakingTicket(duoId, () => {
      void queryClient.invalidateQueries({ queryKey: matchmakingStateKey(userId) });
      void queryClient.invalidateQueries({ queryKey: ["chat"] });
    }, matchId);
  }, [duoId, matchId, queryClient, userId]);
}
