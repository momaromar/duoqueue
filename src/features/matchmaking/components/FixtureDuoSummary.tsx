import { StyleSheet, Text, View } from "react-native";

import type { MockDuoProfile } from "@/src/features/matchmaking/types";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

export function FixtureDuoSummary({ duo }: { duo: MockDuoProfile }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.code}>MATCHED DUO</Text>
      <Text style={styles.name}>{duo.name}</Text>
      <Text style={styles.detail}>{duo.city}</Text>
      <View style={styles.members}>
        {duo.members.map((member) => (
          <View key={member.id} style={styles.member}>
            <View style={styles.initialCircle}>
              <Text style={styles.initial}>{member.displayName.charAt(0)}</Text>
            </View>
            <Text style={styles.memberName}>{member.displayName}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 8,
    borderWidth: 1,
    borderColor: lobbyColors.magenta,
    borderRadius: 12,
    backgroundColor: lobbyColors.surface,
    padding: 16,
  },
  code: { color: lobbyColors.magenta, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  name: { color: lobbyColors.text, fontSize: 22, fontWeight: "900" },
  detail: { color: lobbyColors.muted },
  members: { flexDirection: "row", gap: 18, paddingTop: 4 },
  member: { flexDirection: "row", alignItems: "center", gap: 7 },
  initialCircle: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: lobbyColors.cyan,
    borderRadius: 17,
    backgroundColor: lobbyColors.surfaceRaised,
  },
  initial: { color: lobbyColors.text, fontWeight: "900" },
  memberName: { color: lobbyColors.text, fontWeight: "700" },
});
