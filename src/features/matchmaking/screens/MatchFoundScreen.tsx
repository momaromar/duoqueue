import { Redirect, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import type { DuoProfileStateWithImages } from "@/src/features/duo-profile/schemas";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { FixtureDuoSummary } from "@/src/features/matchmaking/components/FixtureDuoSummary";
import { MatchmakingDuoGate } from "@/src/features/matchmaking/components/MatchmakingDuoGate";
import { MatchmakingSummary } from "@/src/features/matchmaking/components/MatchmakingSummary";
import {
  statusForDuo,
  useMockMatchmakingStore,
} from "@/src/features/matchmaking/mockMatchmakingStore";

export function MatchFoundScreen() {
  return <MatchmakingDuoGate>{(profile) => <MatchFoundContent profile={profile} />}</MatchmakingDuoGate>;
}

function MatchFoundContent({ profile }: { profile: DuoProfileStateWithImages }) {
  const status = useMockMatchmakingStore((state) => statusForDuo(state, profile.duo.id));
  const match = useMockMatchmakingStore((state) => state.match);

  if (status === "idle") return <Redirect href="/(app)" />;
  if (status === "waiting") return <Redirect href="/matchmaking/waiting" />;
  if (!match || match.currentDuoId !== profile.duo.id) return <Redirect href="/(app)" />;

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader title="Match Found" subtitle="Another duo has joined your mock session." />
      <View style={styles.banner} accessibilityLiveRegion="polite">
        <Text style={styles.bannerCode}>MATCH CONFIRMED</Text>
        <Text style={styles.bannerTitle}>{profile.duo.name} × {match.opponent.name}</Text>
      </View>
      <MatchmakingSummary profile={profile} />
      <FixtureDuoSummary duo={match.opponent} />
      <LobbyButton
        label="VIEW MATCHED PROFILE"
        detail="SIX COMBINED ANSWERS"
        onPress={() => router.push("/matchmaking/matched-profile")}
      />
      <LobbyButton
        label="ENTER GROUP CHAT"
        detail="CHAT ARRIVES LATER"
        onPress={() => router.push("/(app)/duo-chats")}
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
