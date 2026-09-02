import { Redirect, router, type Href } from "expo-router";
import { StyleSheet } from "react-native";

import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import {
  MatchmakingDuoGate,
  type MatchmakingGateData,
} from "@/src/features/matchmaking/components/MatchmakingDuoGate";
import {
  MatchedDuoProfile,
  orderOpponentMembers,
} from "@/src/features/matchmaking/components/MatchedDuoProfile";
import { SafetyActions } from "@/src/features/safety/components/SafetyActions";

export function MatchFoundScreen() {
  return (
    <MatchmakingDuoGate>
      {(data) => <MatchFoundContent {...data} />}
    </MatchmakingDuoGate>
  );
}

function MatchFoundContent({ matchmaking }: MatchmakingGateData) {
  if (matchmaking.status === "waiting" || matchmaking.status === "eligible" || matchmaking.status === "matching") {
    return <Redirect href="/matchmaking/waiting" />;
  }
  if (matchmaking.status !== "matched" || !matchmaking.match) return <Redirect href="/(app)" />;
  const match = matchmaking.match;
  const opponent = match.opponent;
  const memberNames = orderOpponentMembers(opponent.members)
    .map((member) => member.displayName)
    .join(" / ");

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader
        showBack
        title={opponent.name}
        subtitle={memberNames}
        onBack={() => router.replace("/(app)")}
        rightActionLabel="CHAT →"
        rightActionAccessibilityLabel={`Open chat with ${opponent.name}`}
        onRightAction={() => {
          const chatHref = `/chat/${match.conversationId}` as Href;
          router.push(chatHref);
        }}
      />
      <MatchedDuoProfile opponent={opponent} />
      <SafetyActions
        matchId={match.id}
        opponentDuoName={opponent.name}
        conversationId={match.conversationId}
      />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 18 },
});
