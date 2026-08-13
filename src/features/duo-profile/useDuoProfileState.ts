import { useQuery } from "@tanstack/react-query";

import { getDuoProfileState } from "@/src/features/duo-profile/duoProfileService";

export function duoProfileStateKey(userId: string | undefined) {
  return ["duo-profile", "current", userId] as const;
}

export function useDuoProfileState(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: duoProfileStateKey(userId),
    queryFn: getDuoProfileState,
    enabled: Boolean(userId) && enabled,
  });
}
