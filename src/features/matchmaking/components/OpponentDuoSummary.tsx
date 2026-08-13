import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import type { MatchmakingStateWithImages } from "@/src/features/matchmaking/schemas";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

type Opponent = NonNullable<MatchmakingStateWithImages["match"]>["opponent"];

export function OpponentDuoSummary({ duo }: { duo: Opponent }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.code}>MATCHED DUO</Text>
      <Text style={styles.name}>{duo.name}</Text>
      <Text style={styles.detail}>{duo.city}</Text>
      <View style={styles.members}>
        {duo.members.map((member) => (
          <View key={member.userId} style={styles.member}>
            {member.imageUrl && (
              <Image
                source={member.imageUrl}
                accessibilityLabel={`${member.displayName}'s Duo Profile image`}
                style={styles.memberImage}
                contentFit="cover"
              />
            )}
            {!member.imageUrl && (
              <View style={styles.initialCircle}>
                <Text style={styles.initial}>{member.displayName.charAt(0)}</Text>
              </View>
            )}
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
  members: { flexDirection: "row", flexWrap: "wrap", gap: 18, paddingTop: 4 },
  member: { flexDirection: "row", alignItems: "center", gap: 7 },
  memberImage: { width: 38, height: 38, borderRadius: 19 },
  initialCircle: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: lobbyColors.cyan,
    borderRadius: 19,
    backgroundColor: lobbyColors.surfaceRaised,
  },
  initial: { color: lobbyColors.text, fontWeight: "900" },
  memberName: { color: lobbyColors.text, fontWeight: "700" },
});
