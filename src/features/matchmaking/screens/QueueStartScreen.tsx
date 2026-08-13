import { Redirect, router } from "expo-router";
import { StyleSheet, Text } from "react-native";

import type { DuoProfileStateWithImages } from "@/src/features/duo-profile/schemas";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { MatchmakingDuoGate } from "@/src/features/matchmaking/components/MatchmakingDuoGate";
import {
  MatchmakingSummary,
  QueueReadinessChecklist,
} from "@/src/features/matchmaking/components/MatchmakingSummary";
import {
  statusForDuo,
  useMockMatchmakingStore,
} from "@/src/features/matchmaking/mockMatchmakingStore";

export function QueueStartScreen() {
  return <MatchmakingDuoGate>{(profile) => <QueueStartContent profile={profile} />}</MatchmakingDuoGate>;
}

function QueueStartContent({ profile }: { profile: DuoProfileStateWithImages }) {
  const status = useMockMatchmakingStore((state) => statusForDuo(state, profile.duo.id));
  const startQueue = useMockMatchmakingStore((state) => state.startQueue);

  if (status === "waiting") return <Redirect href="/matchmaking/waiting" />;
  if (status === "matched") return <Redirect href="/matchmaking/matched" />;

  const confirmQueue = () => {
    startQueue(profile.duo.id);
    router.replace("/matchmaking/waiting");
  };

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader
        showBack
        title="Enter Matchmaking"
        subtitle="Confirm that your duo is ready to find another pair."
      />
      <MatchmakingSummary profile={profile} />
      <QueueReadinessChecklist />
      <Text style={styles.explanation}>
        This preview starts a local five-minute wait. It does not create a Supabase ticket,
        notify your partner, or enter real matchmaking.
      </Text>
      <LobbyButton
        variant="queue"
        label="QUEUE"
        detail="START 05:00 WAIT"
        accessibilityHint="Creates a session-only mock queue ticket"
        onPress={confirmQueue}
      />
      <LobbyButton label="CANCEL" onPress={() => router.back()} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 18 },
  explanation: { color: lobbyColors.muted, lineHeight: 21, textAlign: "center" },
});
