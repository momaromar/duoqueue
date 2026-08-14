import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { getCurrentDuoState, subscribeToDuo } from "@/src/features/duos/duoService";

export function currentDuoStateKey(userId: string | undefined) {
  return ["duos", "current", userId] as const;
}

export function useCurrentDuoState(userId: string | undefined) {
  return useQuery({
    queryKey: currentDuoStateKey(userId),
    queryFn: getCurrentDuoState,
    enabled: Boolean(userId),
  });
}

export function useCurrentDuoRealtime(duoId: string | undefined, userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!duoId || !userId) return;
    return subscribeToDuo(duoId, () => {
      void queryClient.invalidateQueries({ queryKey: currentDuoStateKey(userId) });
      void queryClient.invalidateQueries({ queryKey: ["duo-profile", "current", userId] });
      void queryClient.invalidateQueries({ queryKey: ["matchmaking", "current", userId] });
      void queryClient.invalidateQueries({ queryKey: ["duo-management"] });
    });
  }, [duoId, queryClient, userId]);
}
