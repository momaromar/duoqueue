import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

type LobbyHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightActionLabel?: string;
  rightActionAccessibilityLabel?: string;
  onRightAction?: () => void;
};

export function LobbyHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightActionLabel,
  rightActionAccessibilityLabel,
  onRightAction,
}: LobbyHeaderProps) {
  return (
    <View style={styles.header}>
      {(showBack || rightActionLabel) && (
        <View style={styles.navigationRow}>
          {showBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to main menu"
              onPress={onBack ?? (() => router.back())}
              style={({ pressed }) => [styles.navigationAction, pressed && styles.pressed]}
            >
              <Text style={styles.navigationText}>← MENU</Text>
            </Pressable>
          )}
          {rightActionLabel && onRightAction && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={rightActionAccessibilityLabel ?? rightActionLabel}
              onPress={onRightAction}
              style={({ pressed }) => [styles.navigationAction, styles.rightAction, pressed && styles.pressed]}
            >
              <Text style={styles.navigationText}>{rightActionLabel}</Text>
            </Pressable>
          )}
        </View>
      )}
      <Text style={styles.eyebrow}>DUOQUEUE // LOBBY</Text>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: 5 },
  navigationRow: { minHeight: 44, flexDirection: "row", alignItems: "center" },
  navigationAction: { minHeight: 44, justifyContent: "center" },
  rightAction: { marginLeft: "auto" },
  navigationText: { color: lobbyColors.cyan, fontWeight: "800", letterSpacing: 1.2 },
  pressed: { opacity: 0.65 },
  eyebrow: { color: lobbyColors.magenta, fontSize: 12, fontWeight: "800", letterSpacing: 2 },
  title: { color: lobbyColors.text, fontSize: 28, fontWeight: "900", letterSpacing: 0.6 },
  subtitle: { color: lobbyColors.muted, fontSize: 15, lineHeight: 21 },
});
