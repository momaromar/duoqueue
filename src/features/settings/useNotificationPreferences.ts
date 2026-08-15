import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getNotificationPreferences, updateNotificationPreferences } from "@/src/features/settings/settingsService";

export function notificationPreferencesKey(userId: string | undefined) {
  return ["settings", "notification-preferences", userId] as const;
}

export function useNotificationPreferences(userId: string | undefined) {
  return useQuery({
    queryKey: notificationPreferencesKey(userId),
    queryFn: getNotificationPreferences,
    enabled: Boolean(userId),
  });
}

export function useSaveNotificationPreferences(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: (preferences) => {
      queryClient.setQueryData(notificationPreferencesKey(userId), preferences);
    },
  });
}
