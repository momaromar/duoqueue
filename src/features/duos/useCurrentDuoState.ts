import { useQuery } from "@tanstack/react-query";

import { getCurrentDuoState } from "@/src/features/duos/duoService";

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
