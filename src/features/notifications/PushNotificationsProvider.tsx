import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";

import { useAuth } from "@/src/features/auth/AuthContext";
import { pushNotificationDataSchema } from "@/src/features/notifications/schemas";
import {
  canUseRemotePush,
  disableCurrentPushInstallation,
  refreshPushRegistrationIfAuthorized,
  subscribeToNativePushTokenChanges,
} from "@/src/features/notifications/pushService";
import { useNotificationPreferences } from "@/src/features/settings/useNotificationPreferences";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

function hasEnabledPreference(preferences: {
  duoInvitations: boolean;
  queueStatus: boolean;
  matches: boolean;
  messages: boolean;
  productUpdates: boolean;
}) {
  return preferences.duoInvitations
    || preferences.queueStatus
    || preferences.matches
    || preferences.messages
    || preferences.productUpdates;
}

function navigateFromNotification(notification: Notifications.Notification) {
  const parsed = pushNotificationDataSchema.safeParse(notification.request.content.data);
  if (!parsed.success) return;
  switch (parsed.data.type) {
    case "duo_invitation_accepted":
      router.push("/");
      break;
    case "queue_eligible":
    case "queue_expired":
      router.push("/matchmaking/waiting");
      break;
    case "match_found":
      router.push("/matchmaking/matched");
      break;
    case "new_message":
      router.push(`/chat/${parsed.data.conversationId}`);
      break;
  }
}

export function PushNotificationsProvider({ children }: { children: React.ReactNode }) {
  const { isInitializing, user } = useAuth();
  const preferences = useNotificationPreferences(user?.id);
  const activeUserId = useRef<string | null>(null);
  const canNavigate = useRef(false);
  const pendingNotification = useRef<Notifications.Notification | null>(null);

  useEffect(() => {
    if (!canUseRemotePush()) return;
    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) {
      pendingNotification.current = response.notification;
      void Notifications.clearLastNotificationResponseAsync();
    }
    const subscription = Notifications.addNotificationResponseReceivedListener((next) => {
      if (canNavigate.current) {
        navigateFromNotification(next.notification);
      } else {
        pendingNotification.current = next.notification;
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    canNavigate.current = !isInitializing && Boolean(user);
    if (canNavigate.current && pendingNotification.current) {
      navigateFromNotification(pendingNotification.current);
      pendingNotification.current = null;
    }
  }, [isInitializing, user]);

  useEffect(() => {
    if (isInitializing || !user || !preferences.data) return;
    activeUserId.current = user.id;
    if (!hasEnabledPreference(preferences.data)) {
      void disableCurrentPushInstallation().catch(() => undefined);
      return;
    }

    const refresh = () => {
      if (activeUserId.current === user.id) {
        void refreshPushRegistrationIfAuthorized().catch(() => undefined);
      }
    };
    refresh();
    return subscribeToNativePushTokenChanges(refresh);
  }, [isInitializing, preferences.data, user]);

  useEffect(() => {
    if (!user) activeUserId.current = null;
  }, [user]);

  return children;
}
