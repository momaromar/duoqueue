import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { ChatEmptyState } from "@/src/features/chat/components/ChatEmptyState";
import { latestLocalMessage, useLocalChatStore } from "@/src/features/chat/localChatStore";
import { useLocalChatSession } from "@/src/features/chat/useLocalChatSession";
import type { DuoProfileStateWithImages } from "@/src/features/duo-profile/schemas";
import { useDuoProfileState } from "@/src/features/duo-profile/useDuoProfileState";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { OpponentDuoSummary } from "@/src/features/matchmaking/components/OpponentDuoSummary";
import type { MatchmakingStateWithImages } from "@/src/features/matchmaking/schemas";
import {
  useMatchmakingRealtime,
  useMatchmakingState,
} from "@/src/features/matchmaking/useMatchmakingState";

type ActiveMatch = NonNullable<MatchmakingStateWithImages["match"]>;

function activityLabel(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function DuoChatsScreen() {
  const { user } = useAuth();
  const matchmakingQuery = useMatchmakingState(user?.id);
  const profileQuery = useDuoProfileState(user?.id);
  const resetLocalChat = useLocalChatStore((state) => state.reset);
  const refetchMatchmaking = matchmakingQuery.refetch;
  const refetchProfile = profileQuery.refetch;
  const duoId = matchmakingQuery.data?.duo?.id;
  useMatchmakingRealtime(duoId, user?.id);

  useFocusEffect(useCallback(() => {
    void refetchMatchmaking();
    void refetchProfile();
  }, [refetchMatchmaking, refetchProfile]));

  useEffect(() => {
    if (!matchmakingQuery.isPending && matchmakingQuery.data && !matchmakingQuery.data.match) {
      resetLocalChat();
    }
  }, [matchmakingQuery.data, matchmakingQuery.isPending, resetLocalChat]);

  if (matchmakingQuery.isPending || profileQuery.isPending) return <LoadingView label="Loading conversationsâ€¦" />;
  const error = matchmakingQuery.error ?? profileQuery.error;
  if (error) return <DuoStateErrorScreen error={error} onRetry={() => void matchmakingQuery.refetch()} />;
  if (!matchmakingQuery.data || !profileQuery.data) return <LoadingView label="Loading conversationsâ€¦" />;

  const match = matchmakingQuery.data.match;
  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader showBack title="Duo Chats" subtitle="Four-player conversation channels." />
      <View style={styles.previewNotice}>
        <Text style={styles.previewCode}>PHASE 10 LOCAL PREVIEW</Text>
        <Text style={styles.previewCopy}>Messages stay on this device process, are not shared, and reset after a full restart.</Text>
      </View>
      {!match && <ChatEmptyState />}
      {match && <ConversationCard userId={user?.id} profile={profileQuery.data} match={match} />}
      <LobbyButton label="BACK TO LOBBY" onPress={() => router.back()} />
    </LobbyScreen>
  );
}

function ConversationCard({ userId, profile, match }: { userId: string | undefined; profile: DuoProfileStateWithImages; match: ActiveMatch }) {
  useLocalChatSession(userId, profile, match);
  const latestMessage = useLocalChatStore(latestLocalMessage);
  const unreadCount = useLocalChatStore((state) => state.unreadCount);
  let preview = "Local conversation ready";
  let lastActivity = match.matchedAt;
  if (latestMessage) {
    preview = latestMessage.body;
    lastActivity = latestMessage.createdAt;
    if (latestMessage.kind === "text") preview = `${latestMessage.sender.displayName}: ${latestMessage.body}`;
  }

  return (
    <View style={styles.channel}>
      <View style={styles.channelHeading}>
        <Text style={styles.channelCode}>ACTIVE CHANNEL</Text>
        {unreadCount > 0 && (
          <View style={styles.badge} accessibilityLabel={`${unreadCount} unread local messages`}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>
      <OpponentDuoSummary duo={match.opponent} />
      <Text numberOfLines={2} style={styles.messagePreview}>{preview}</Text>
      <Text style={styles.activity}>LOCAL ACTIVITY {activityLabel(lastActivity)}</Text>
      <LobbyButton
        label="OPEN CONVERSATION"
        detail="SESSION-ONLY MESSAGES"
        onPress={() => router.push(`/chat/${match.conversationId}` as Href)}
      />
      <LobbyButton label="VIEW MATCH DETAILS" onPress={() => router.push("/matchmaking/matched")} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 20 },
  previewNotice: { gap: 6, borderWidth: 1, borderColor: lobbyColors.magenta, borderRadius: 12, backgroundColor: "#24132D", padding: 14 },
  previewCode: { color: lobbyColors.magenta, fontWeight: "900", letterSpacing: 1.7 },
  previewCopy: { color: lobbyColors.text, lineHeight: 20 },
  channel: { gap: 14, borderWidth: 1, borderColor: lobbyColors.green, borderRadius: 14, backgroundColor: lobbyColors.surface, padding: 16 },
  channelHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  channelCode: { color: lobbyColors.green, fontWeight: "900", letterSpacing: 2 },
  badge: { minWidth: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: lobbyColors.magenta, paddingHorizontal: 7 },
  badgeText: { color: lobbyColors.background, fontWeight: "900" },
  messagePreview: { color: lobbyColors.text, lineHeight: 20 },
  activity: { color: lobbyColors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
});
