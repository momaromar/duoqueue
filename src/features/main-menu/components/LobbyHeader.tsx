import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

type LobbyHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
};

export function LobbyHeader({ title, subtitle, showBack = false }: LobbyHeaderProps) {
  return (
    <View style={styles.header}>
      {showBack && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to main menu"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Text style={styles.backText}>← MENU</Text>
        </Pressable>
      )}
      <Text style={styles.eyebrow}>DUOQUEUE // LOBBY</Text>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: 5 },
  back: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center" },
  backText: { color: lobbyColors.cyan, fontWeight: "800", letterSpacing: 1.2 },
  pressed: { opacity: 0.65 },
  eyebrow: { color: lobbyColors.magenta, fontSize: 12, fontWeight: "800", letterSpacing: 2 },
  title: { color: lobbyColors.text, fontSize: 28, fontWeight: "900", letterSpacing: 0.6 },
  subtitle: { color: lobbyColors.muted, fontSize: 15, lineHeight: 21 },
});
