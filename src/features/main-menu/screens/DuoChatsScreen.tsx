import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { OpponentDuoSummary } from "@/src/features/matchmaking/components/OpponentDuoSummary";
import {
  useMatchmakingRealtime,
  useMatchmakingState,
} from "@/src/features/matchmaking/useMatchmakingState";

export function DuoChatsScreen() {
  const { user } = useAuth();
  const matchmakingQuery = useMatchmakingState(user?.id);
  const duoId = matchmakingQuery.data?.duo?.id;
  useMatchmakingRealtime(duoId, user?.id);

  if (matchmakingQuery.isPending) return <LoadingView label="Loading conversations…" />;
  if (matchmakingQuery.error) {
    return <DuoStateErrorScreen error={matchmakingQuery.error} onRetry={matchmakingQuery.refetch} />;
  }

  const match = matchmakingQuery.data.match;

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader showBack title="Duo Chats" subtitle="Channels created from real matches." />
      {!match && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyCode}>NO ACTIVE CHANNELS</Text>
          <Text style={styles.emptyTitle}>Your chat list is empty</Text>
          <Text style={styles.emptyCopy}>
            A conversation channel will appear after your duo completes matchmaking.
          </Text>
        </View>
      )}
      {match && (
        <View style={styles.channel}>
          <Text style={styles.channelCode}>CHANNEL READY</Text>
          <OpponentDuoSummary duo={match.opponent} />
          <Text style={styles.emptyCopy}>
            Conversation {match.conversationId} exists and all four members are authorized.
            Messages and the conversation UI arrive in Phase 10.
          </Text>
          <LobbyButton label="VIEW MATCH DETAILS" onPress={() => router.push("/matchmaking/matched")} />
        </View>
      )}
      <LobbyButton label="BACK TO LOBBY" onPress={() => router.back()} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 24 },
  emptyState: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: lobbyColors.border,
    borderRadius: 14,
    backgroundColor: lobbyColors.surface,
    padding: 24,
  },
  channel: {
    gap: 14,
    borderWidth: 1,
    borderColor: lobbyColors.green,
    borderRadius: 14,
    backgroundColor: lobbyColors.surface,
    padding: 16,
  },
  emptyCode: { color: lobbyColors.magenta, fontWeight: "900", letterSpacing: 2 },
  channelCode: { color: lobbyColors.green, fontWeight: "900", letterSpacing: 2 },
  emptyTitle: { color: lobbyColors.text, fontSize: 22, fontWeight: "800", textAlign: "center" },
  emptyCopy: { color: lobbyColors.muted, lineHeight: 21, textAlign: "center" },
});
