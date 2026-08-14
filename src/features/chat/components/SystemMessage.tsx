import { StyleSheet, Text, View } from "react-native";

import type { ChatSystemMessage } from "@/src/features/chat/types";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

export function SystemMessage({ message }: { message: ChatSystemMessage }) {
  return (
    <View style={styles.wrapper} accessibilityLabel={`System message: ${message.body}`}>
      <Text style={styles.label}>MATCH SYSTEM</Text>
      <Text style={styles.body}>{message.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignSelf: "center", maxWidth: 560, gap: 4, borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 10, backgroundColor: lobbyColors.surface, paddingHorizontal: 14, paddingVertical: 9 },
  label: { color: lobbyColors.magenta, fontSize: 10, fontWeight: "900", letterSpacing: 1.5, textAlign: "center" },
  body: { color: lobbyColors.muted, fontSize: 12, lineHeight: 17, textAlign: "center" },
});
