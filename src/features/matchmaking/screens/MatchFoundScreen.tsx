import { Redirect, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import {
  MatchmakingDuoGate,
  type MatchmakingGateData,
} from "@/src/features/matchmaking/components/MatchmakingDuoGate";
import { MatchmakingSummary } from "@/src/features/matchmaking/components/MatchmakingSummary";
import { OpponentDuoSummary } from "@/src/features/matchmaking/components/OpponentDuoSummary";
import { SafetyActions } from "@/src/features/safety/components/SafetyActions";

export function MatchFoundScreen() {
  return (
    <MatchmakingDuoGate>
      {(data) => <MatchFoundContent {...data} />}
    </MatchmakingDuoGate>
  );
}

function MatchFoundContent({ profile, matchmaking }: MatchmakingGateData) {
  if (matchmaking.status === "waiting" || matchmaking.status === "eligible" || matchmaking.status === "matching") {
    return <Redirect href="/matchmaking/waiting" />;
  }
  if (matchmaking.status !== "matched" || !matchmaking.match) return <Redirect href="/(app)" />;
  const match = matchmaking.match;

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader title="Match Found" subtitle="Your server-backed duo match is ready." />
      <View style={styles.banner} accessibilityLiveRegion="polite">
        <Text style={styles.bannerCode}>MATCH CONFIRMED</Text>
        <Text style={styles.bannerTitle}>{profile.duo.name} × {match.opponent.name}</Text>
      </View>
      <MatchmakingSummary profile={profile} />
      <OpponentDuoSummary duo={match.opponent} />
      <LobbyButton
        label="VIEW MATCHED PROFILE"
        detail="SIX COMBINED ANSWERS"
        onPress={() => router.push("/matchmaking/matched-profile")}
      />
      <LobbyButton
        label="VIEW DUO CHAT"
        detail="CHANNEL CREATED · MESSAGING PHASE 10"
        onPress={() => router.push("/(app)/duo-chats")}
      />
      <SafetyActions
        matchId={match.id}
        opponentDuoName={match.opponent.name}
        conversationId={match.conversationId}
      />
      <LobbyButton label="BACK TO LOBBY" onPress={() => router.replace("/(app)")} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 18 },
  banner: {
    alignItems: "center",
    gap: 7,
    borderWidth: 2,
    borderColor: lobbyColors.green,
    borderRadius: 14,
    backgroundColor: "#09241E",
    padding: 20,
  },
  bannerCode: { color: lobbyColors.green, fontWeight: "900", letterSpacing: 2 },
  bannerTitle: { color: lobbyColors.text, fontSize: 20, fontWeight: "900", textAlign: "center" },
});
