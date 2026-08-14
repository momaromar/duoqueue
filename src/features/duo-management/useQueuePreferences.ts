import { useQuery } from "@tanstack/react-query";

import { getQueuePreferences } from "@/src/features/duo-management/duoManagementService";

export function queuePreferencesKey(userId: string | undefined) {
  return ["duo-management", "queue-preferences", userId] as const;
}

export function useQueuePreferences(userId: string | undefined) {
  return useQuery({
    queryKey: queuePreferencesKey(userId),
    queryFn: getQueuePreferences,
    enabled: Boolean(userId),
  });
}
