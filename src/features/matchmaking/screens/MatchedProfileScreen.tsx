import { Redirect, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import type { DuoProfileStateWithImages, MemberColorKey } from "@/src/features/duo-profile/schemas";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { FixtureDuoSummary } from "@/src/features/matchmaking/components/FixtureDuoSummary";
import { MatchmakingDuoGate } from "@/src/features/matchmaking/components/MatchmakingDuoGate";
import {
  statusForDuo,
  useMockMatchmakingStore,
} from "@/src/features/matchmaking/mockMatchmakingStore";

function contributionColor(colorKey: MemberColorKey) {
  if (colorKey === "member_a") return styles.memberA;
  return styles.memberB;
}

export function MatchedProfileScreen() {
  return <MatchmakingDuoGate>{(profile) => <MatchedProfileContent profile={profile} />}</MatchmakingDuoGate>;
}

function MatchedProfileContent({ profile }: { profile: DuoProfileStateWithImages }) {
  const status = useMockMatchmakingStore((state) => statusForDuo(state, profile.duo.id));
  const match = useMockMatchmakingStore((state) => state.match);

  if (status === "idle") return <Redirect href="/(app)" />;
  if (status === "waiting") return <Redirect href="/matchmaking/waiting" />;
  if (!match || match.currentDuoId !== profile.duo.id) return <Redirect href="/(app)" />;

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader
        showBack
        title={match.opponent.name}
        subtitle="Fixture combined Duo Profile"
      />
      <FixtureDuoSummary duo={match.opponent} />
      <Text style={styles.description}>{match.opponent.description}</Text>
      <View style={styles.answers}>
        {match.opponent.answers.map((answer) => (
          <View
            key={answer.promptId}
            style={[styles.answer, contributionColor(answer.contributor.colorKey)]}
          >
            <Text style={styles.promptNumber}>PROMPT {answer.sortOrder} OF 6</Text>
            <Text style={styles.question}>{answer.promptText}</Text>
            <Text style={styles.response}>{answer.responseText}</Text>
            <Text style={styles.contributor}>
              Answered by {answer.contributor.displayName} · {answer.contributor.colorKey}
            </Text>
          </View>
        ))}
      </View>
      <LobbyButton label="BACK TO MATCH" onPress={() => router.back()} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 18 },
  description: { color: lobbyColors.text, lineHeight: 22 },
  answers: { gap: 12 },
  answer: { gap: 7, borderWidth: 1, borderRadius: 12, padding: 14 },
  memberA: { borderColor: lobbyColors.memberA, backgroundColor: "#0A2034" },
  memberB: { borderColor: lobbyColors.memberB, backgroundColor: "#2A1815" },
  promptNumber: { color: lobbyColors.muted, fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  question: { color: lobbyColors.text, fontWeight: "800", lineHeight: 20 },
  response: { color: lobbyColors.text, lineHeight: 21 },
  contributor: { color: lobbyColors.muted, fontSize: 12 },
});
