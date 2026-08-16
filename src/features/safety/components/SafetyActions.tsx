import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { BlockOpponentPanel } from "@/src/features/safety/components/BlockOpponentPanel";
import { reportHref } from "@/src/features/safety/navigation";

type SafetyActionsProps = {
  matchId: string;
  opponentDuoName: string;
  conversationId: string;
};

export function SafetyActions({ matchId, opponentDuoName, conversationId }: SafetyActionsProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>SAFETY ACTIONS</Text>
      <Text style={styles.copy}>Reports preserve context for later review. Reporting alone does not block anyone.</Text>
      <LobbyButton label="REPORT CONVERSATION" onPress={() => router.push(reportHref("conversation", conversationId))} />
      <BlockOpponentPanel matchId={matchId} opponentDuoName={opponentDuoName} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 10, borderWidth: 1, borderColor: lobbyColors.danger, borderRadius: 14, backgroundColor: lobbyColors.surface, padding: 14 },
  title: { color: lobbyColors.danger, fontWeight: "900", letterSpacing: 1.4 },
  copy: { color: lobbyColors.muted, lineHeight: 20 },
});
