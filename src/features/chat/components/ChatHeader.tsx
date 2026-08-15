import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

type ChatHeaderProps = { ownDuoName: string; opponentDuoName: string };

export function ChatHeader({ ownDuoName, opponentDuoName }: ChatHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to Duo Chats"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Text style={styles.backText}>â† CHATS</Text>
      </Pressable>
      <View style={styles.titleGroup}>
        <Text accessibilityRole="header" style={styles.title}>{ownDuoName} Ã— {opponentDuoName}</Text>
        <Text style={styles.subtitle}>LIVE DUO CHAT</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${opponentDuoName} profile`}
        onPress={() => router.push("/matchmaking/matched-profile")}
        style={({ pressed }) => [styles.profile, pressed && styles.pressed]}
      >
        <Text style={styles.profileText}>PROFILE</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: lobbyColors.border, backgroundColor: lobbyColors.surface, paddingHorizontal: 14, paddingVertical: 10 },
  back: { minHeight: 44, justifyContent: "center" },
  backText: { color: lobbyColors.cyan, fontWeight: "900", letterSpacing: 1 },
  titleGroup: { flex: 1, alignItems: "center", gap: 3 },
  title: { color: lobbyColors.text, fontSize: 16, fontWeight: "900", textAlign: "center" },
  subtitle: { color: lobbyColors.green, fontSize: 10, fontWeight: "800", letterSpacing: 1.2, textAlign: "center" },
  profile: { minHeight: 44, justifyContent: "center" },
  profileText: { color: lobbyColors.green, fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  pressed: { opacity: 0.6 },
});
