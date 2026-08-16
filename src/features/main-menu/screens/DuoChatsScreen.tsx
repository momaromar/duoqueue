import { useIsFocused } from "@react-navigation/native";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { ChatEmptyState } from "@/src/features/chat/components/ChatEmptyState";
import {
  useConversationRealtime,
  useConversationSummary,
} from "@/src/features/chat/useChat";
import { useChatParticipants } from "@/src/features/chat/useChatParticipants";
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
  const refetchMatchmaking = matchmakingQuery.refetch;
  const refetchProfile = profileQuery.refetch;
  const duoId = matchmakingQuery.data?.duo?.id;
  useMatchmakingRealtime(duoId, user?.id, matchmakingQuery.data?.match?.id);

  useFocusEffect(useCallback(() => {
    void refetchMatchmaking();
    void refetchProfile();
  }, [refetchMatchmaking, refetchProfile]));

  if (matchmakingQuery.isPending || profileQuery.isPending) {
    return <LoadingView label="Loading conversationsâ€¦" />;
  }
  const error = matchmakingQuery.error ?? profileQuery.error;
  if (error) {
    return <DuoStateErrorScreen error={error} onRetry={() => void matchmakingQuery.refetch()} />;
  }
  if (!matchmakingQuery.data || !profileQuery.data) {
    return <LoadingView label="Loading conversationsâ€¦" />;
  }

  const match = matchmakingQuery.data.match;
  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader showBack title="Duo Chats" subtitle="Four-player conversation channels." />
      {!match && <ChatEmptyState />}
      {match && (
        <ConversationCard
          userId={user?.id}
          profile={profileQuery.data}
          match={match}
        />
      )}
      <LobbyButton label="BACK TO LOBBY" onPress={() => router.back()} />
    </LobbyScreen>
  );
}

function ConversationCard({ userId, profile, match }: { userId: string | undefined; profile: DuoProfileStateWithImages; match: ActiveMatch }) {
  const isFocused = useIsFocused();
  const summaryQuery = useConversationSummary(userId, match.conversationId);
  const { participants } = useChatParticipants(userId, profile, match);
  const refetchSummary = summaryQuery.refetch;
  useConversationRealtime(userId, match.conversationId, isFocused);

  useFocusEffect(useCallback(() => {
    void refetchSummary();
  }, [refetchSummary]));

  if (summaryQuery.isPending) return <LoadingView label="Loading conversation summaryâ€¦" />;
  if (summaryQuery.error) {
    return <DuoStateErrorScreen error={summaryQuery.error} onRetry={summaryQuery.refetch} />;
  }

  const summary = summaryQuery.data;
  let preview = "Conversation ready";
  if (summary.lastMessage) {
    preview = summary.lastMessage.body;
    if (summary.lastMessage.kind === "text") {
      const sender = participants.find(
        (participant) => participant.userId === summary.lastMessage?.senderUserId,
      );
      if (sender) preview = `${sender.displayName}: ${summary.lastMessage.body}`;
    }
  }

  return (
    <View style={styles.channel}>
      <View style={styles.channelHeading}>
        <Text style={styles.channelCode}>ACTIVE CHANNEL</Text>
        {summary.unreadCount > 0 && (
          <View style={styles.badge} accessibilityLabel={`${summary.unreadCount} unread messages`}>
            <Text style={styles.badgeText}>{summary.unreadCount}</Text>
          </View>
        )}
      </View>
      <OpponentDuoSummary duo={match.opponent} />
      <Text numberOfLines={2} style={styles.messagePreview}>{preview}</Text>
      <Text style={styles.activity}>LAST ACTIVITY {activityLabel(summary.lastActivityAt)}</Text>
      <LobbyButton
        label="OPEN CONVERSATION"
        detail="SHARED DUO CHAT"
        onPress={() => router.push(`/chat/${match.conversationId}` as Href)}
      />
      <LobbyButton label="VIEW MATCH DETAILS" onPress={() => router.push("/matchmaking/matched")} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 20 },
  channel: { gap: 14, borderWidth: 1, borderColor: lobbyColors.green, borderRadius: 14, backgroundColor: lobbyColors.surface, padding: 16 },
  channelHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  channelCode: { color: lobbyColors.green, fontWeight: "900", letterSpacing: 2 },
  badge: { minWidth: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: lobbyColors.magenta, paddingHorizontal: 7 },
  badgeText: { color: lobbyColors.background, fontWeight: "900" },
  messagePreview: { color: lobbyColors.text, lineHeight: 20 },
  activity: { color: lobbyColors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
});
