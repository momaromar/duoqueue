import { StyleSheet, Text, View } from "react-native";

import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

export function ChatEmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.code}>NO ACTIVE CHANNELS</Text>
      <Text style={styles.title}>Your chat list is empty</Text>
      <Text style={styles.copy}>A conversation appears after your duo completes matchmaking.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: { flex: 1, minHeight: 300, alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 14, backgroundColor: lobbyColors.surface, padding: 24 },
  code: { color: lobbyColors.magenta, fontWeight: "900", letterSpacing: 2 },
  title: { color: lobbyColors.text, fontSize: 22, fontWeight: "800", textAlign: "center" },
  copy: { color: lobbyColors.muted, lineHeight: 21, textAlign: "center" },
});
