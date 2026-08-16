import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/src/features/auth/AuthContext";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { useBlockOpponentDuo } from "@/src/features/safety/useSafety";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function BlockOpponentPanel({ matchId, opponentDuoName, compact = false }: { matchId: string; opponentDuoName: string; compact?: boolean }) {
  const { user } = useAuth();
  const mutation = useBlockOpponentDuo(user?.id);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const block = async () => {
    setError(null);
    try {
      await mutation.mutateAsync(matchId);
      router.replace("/(app)");
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    }
  };

  if (!confirming) {
    let detail: string | undefined = "ENDS THIS MATCH AND CHAT";
    if (compact) detail = undefined;
    return <LobbyButton label="BLOCK OPPONENT DUO" detail={detail} onPress={() => setConfirming(true)} />;
  }

  return (
    <View style={styles.warning}>
      <Text style={styles.title}>END MATCH WITH {opponentDuoName.toUpperCase()}?</Text>
      <Text style={styles.copy}>Both opponent accounts will be blocked. This immediately closes the match and conversation for all four people. It cannot restore the old chat later.</Text>
      {error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
      <View style={styles.actions}>
        <LobbyButton label="CONFIRM BLOCK" disabled={mutation.isPending} onPress={() => void block()} />
        <LobbyButton label="KEEP MATCH" disabled={mutation.isPending} onPress={() => setConfirming(false)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  warning: { gap: 10, borderWidth: 1, borderColor: lobbyColors.danger, borderRadius: 12, backgroundColor: "#2B101A", padding: 14 },
  title: { color: lobbyColors.danger, fontWeight: "900", letterSpacing: 1.1 },
  copy: { color: lobbyColors.text, lineHeight: 20 },
  actions: { flexDirection: "row", gap: 10 },
  error: { color: lobbyColors.danger, lineHeight: 20 },
});
