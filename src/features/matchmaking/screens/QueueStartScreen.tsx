import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { useAuth } from "@/src/features/auth/AuthContext";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import {
  MatchmakingDuoGate,
  type MatchmakingGateData,
} from "@/src/features/matchmaking/components/MatchmakingDuoGate";
import {
  MatchmakingSummary,
  QueueReadinessChecklist,
} from "@/src/features/matchmaking/components/MatchmakingSummary";
import { enterMatchmaking } from "@/src/features/matchmaking/matchmakingService";
import { matchmakingStateKey } from "@/src/features/matchmaking/useMatchmakingState";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function QueueStartScreen() {
  return (
    <MatchmakingDuoGate>
      {(data) => <QueueStartContent {...data} />}
    </MatchmakingDuoGate>
  );
}

function QueueStartContent({ profile, matchmaking }: MatchmakingGateData) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: enterMatchmaking });
  const status = matchmaking.status;

  if (status === "waiting" || status === "eligible" || status === "matching") {
    return <Redirect href="/matchmaking/waiting" />;
  }
  if (status === "matched") return <Redirect href="/matchmaking/matched" />;

  const confirmQueue = async () => {
    setActionError(null);
    try {
      const nextState = await mutation.mutateAsync();
      queryClient.setQueryData(matchmakingStateKey(user?.id), nextState);
      if (nextState.status === "matched") {
        router.replace("/matchmaking/matched");
        return;
      }
      router.replace("/matchmaking/waiting");
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  let previousNotice: string | null = null;
  if (status === "cancelled") previousNotice = "The previous queue was cancelled. You can start a new search.";
  if (status === "expired") previousNotice = "The previous queue expired after 30 minutes. You can queue again.";
  if (status === "failed") previousNotice = "The previous queue failed. Review readiness and try again.";

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader showBack title="Enter Matchmaking" subtitle="Confirm your duo’s real queue entry." />
      <MatchmakingSummary profile={profile} />
      <QueueReadinessChecklist />
      {previousNotice && <Text accessibilityLiveRegion="polite" style={styles.notice}>{previousNotice}</Text>}
      <Text style={styles.explanation}>
        The first member whose request succeeds becomes the queue initiator. Matchmaking uses
        your duo’s current region and a server-enforced five-minute wait.
      </Text>
      <LobbyButton
        variant="queue"
        label="QUEUE"
        detail="START REAL 05:00 WAIT"
        disabled={mutation.isPending || !matchmaking.readiness.canQueue}
        accessibilityHint="Creates or resumes the shared Supabase queue ticket"
        onPress={() => void confirmQueue()}
      />
      {!matchmaking.readiness.canQueue && <Text style={styles.error}>{matchmaking.readiness.reason}</Text>}
      {actionError && <Text accessibilityLiveRegion="polite" style={styles.error}>{actionError}</Text>}
      <LobbyButton label="CANCEL" disabled={mutation.isPending} onPress={() => router.back()} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 18 },
  explanation: { color: lobbyColors.muted, lineHeight: 21, textAlign: "center" },
  notice: { color: lobbyColors.cyan, lineHeight: 20, textAlign: "center" },
  error: { color: lobbyColors.danger, lineHeight: 20, textAlign: "center" },
});
