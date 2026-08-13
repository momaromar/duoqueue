import { StyleSheet, Text, View } from "react-native";

import type { DuoProfileStateWithImages } from "@/src/features/duo-profile/schemas";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

export function MatchmakingSummary({ profile }: { profile: DuoProfileStateWithImages }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.code}>YOUR DUO</Text>
      <Text style={styles.name}>{profile.duo.name}</Text>
      <Text style={styles.detail}>{profile.duo.city}</Text>
      <Text style={styles.detail}>
        {profile.members.map((member) => member.displayName).join(" + ")}
      </Text>
    </View>
  );
}

export function QueueReadinessChecklist() {
  return (
    <View style={styles.panel} accessibilityLabel="Queue readiness checklist">
      <Text style={styles.code}>READINESS CHECK</Text>
      <Text style={styles.ready}>✓ Active duo</Text>
      <Text style={styles.ready}>✓ Two accepted members</Text>
      <Text style={styles.ready}>✓ Combined profile complete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 7,
    borderWidth: 1,
    borderColor: lobbyColors.border,
    borderRadius: 12,
    backgroundColor: lobbyColors.surface,
    padding: 16,
  },
  code: { color: lobbyColors.cyan, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  name: { color: lobbyColors.text, fontSize: 22, fontWeight: "900" },
  detail: { color: lobbyColors.muted, lineHeight: 20 },
  ready: { color: lobbyColors.green, fontWeight: "700" },
});
