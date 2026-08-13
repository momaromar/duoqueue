import { Redirect, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import type { MemberColorKey } from "@/src/features/duo-profile/schemas";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import {
  MatchmakingDuoGate,
  type MatchmakingGateData,
} from "@/src/features/matchmaking/components/MatchmakingDuoGate";
import { OpponentDuoSummary } from "@/src/features/matchmaking/components/OpponentDuoSummary";

function contributionColor(colorKey: MemberColorKey) {
  if (colorKey === "member_a") return styles.memberA;
  return styles.memberB;
}

export function MatchedProfileScreen() {
  return (
    <MatchmakingDuoGate>
      {(data) => <MatchedProfileContent {...data} />}
    </MatchmakingDuoGate>
  );
}

function MatchedProfileContent({ matchmaking }: MatchmakingGateData) {
  if (matchmaking.status === "waiting" || matchmaking.status === "eligible" || matchmaking.status === "matching") {
    return <Redirect href="/matchmaking/waiting" />;
  }
  if (matchmaking.status !== "matched" || !matchmaking.match) return <Redirect href="/(app)" />;
  const opponent = matchmaking.match.opponent;

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader showBack title={opponent.name} subtitle="Matched combined Duo Profile" />
      <OpponentDuoSummary duo={opponent} />
      {opponent.description && <Text style={styles.description}>{opponent.description}</Text>}
      <View style={styles.answers}>
        {opponent.answers.map((answer) => (
          <View key={answer.promptId} style={[styles.answer, contributionColor(answer.colorKey)]}>
            <Text style={styles.promptNumber}>PROMPT {answer.sortOrder} OF 6</Text>
            <Text style={styles.question}>{answer.promptText}</Text>
            <Text style={styles.response}>{answer.responseText}</Text>
            <Text style={styles.contributor}>
              Answered by {answer.displayName} · {answer.colorKey}
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
