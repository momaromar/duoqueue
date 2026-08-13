import { Redirect, router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AppState, StyleSheet, Text, View } from "react-native";

import type { DuoProfileStateWithImages } from "@/src/features/duo-profile/schemas";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { MatchmakingDuoGate } from "@/src/features/matchmaking/components/MatchmakingDuoGate";
import { MatchmakingSummary } from "@/src/features/matchmaking/components/MatchmakingSummary";
import {
  statusForDuo,
  useMockMatchmakingStore,
} from "@/src/features/matchmaking/mockMatchmakingStore";

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function QueueWaitingScreen() {
  return <MatchmakingDuoGate>{(profile) => <WaitingContent profile={profile} />}</MatchmakingDuoGate>;
}

function WaitingContent({ profile }: { profile: DuoProfileStateWithImages }) {
  const status = useMockMatchmakingStore((state) => statusForDuo(state, profile.duo.id));
  const ticket = useMockMatchmakingStore((state) => state.ticket);
  const completeWait = useMockMatchmakingStore((state) => state.completeWait);
  const cancelQueue = useMockMatchmakingStore((state) => state.cancelQueue);
  const [remainingMs, setRemainingMs] = useState(0);

  const refreshCountdown = useCallback(() => {
    if (!ticket || ticket.duoId !== profile.duo.id) return;
    const nextRemaining = Math.max(0, ticket.eligibleAt - Date.now());
    setRemainingMs(nextRemaining);
    if (nextRemaining === 0) completeWait(profile.duo.id);
  }, [completeWait, profile.duo.id, ticket]);

  useEffect(() => {
    refreshCountdown();
    const interval = setInterval(refreshCountdown, 250);
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") refreshCountdown();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [refreshCountdown]);

  useFocusEffect(useCallback(() => {
    refreshCountdown();
  }, [refreshCountdown]));

  if (status === "idle" || !ticket || ticket.duoId !== profile.duo.id) {
    return <Redirect href="/matchmaking/queue" />;
  }
  if (status === "matched") return <Redirect href="/matchmaking/matched" />;

  const cancel = () => {
    cancelQueue();
    router.replace("/(app)");
  };

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader title="Searching for a Duo" subtitle="Your local mock ticket is waiting." />
      <MatchmakingSummary profile={profile} />
      <View style={styles.timerPanel} accessibilityLiveRegion="polite">
        <Text style={styles.timerLabel}>ELIGIBLE IN</Text>
        <Text style={styles.timer}>{formatCountdown(remainingMs)}</Text>
        <Text style={styles.timerDetail}>Mock ticket: {ticket.id}</Text>
      </View>
      <Text style={styles.explanation}>
        When the wait finishes, this preview pairs you with a fixture duo. The future real
        queue will use a backend timestamp as its source of truth.
      </Text>
      {__DEV__ && (
        <LobbyButton
          label="FINISH MOCK WAIT"
          detail="DEVELOPMENT ONLY"
          onPress={() => completeWait(profile.duo.id)}
        />
      )}
      <LobbyButton label="CANCEL QUEUE" onPress={cancel} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 20 },
  timerPanel: {
    alignItems: "center",
    gap: 6,
    borderWidth: 2,
    borderColor: lobbyColors.cyan,
    borderRadius: 16,
    backgroundColor: "#081E36",
    padding: 24,
  },
  timerLabel: { color: lobbyColors.cyan, fontWeight: "900", letterSpacing: 2 },
  timer: { color: lobbyColors.text, fontSize: 56, fontWeight: "900", letterSpacing: 4 },
  timerDetail: { color: lobbyColors.muted, fontSize: 11, textAlign: "center" },
  explanation: { color: lobbyColors.muted, lineHeight: 21, textAlign: "center" },
});
