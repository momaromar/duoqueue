import { Pressable, StyleSheet, Text, View } from "react-native";

import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

type GameResignationConfirmationProps = {
  opponentName: string;
  disabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmationButton({
  label,
  danger,
  disabled,
  onPress,
}: {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        danger && styles.dangerAction,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.actionText, danger && styles.dangerText]}>{label}</Text>
    </Pressable>
  );
}

export function GameResignationConfirmation({
  opponentName,
  disabled = false,
  onConfirm,
  onCancel,
}: GameResignationConfirmationProps) {
  return (
    <View style={styles.panel} accessibilityLiveRegion="polite">
      <Text accessibilityRole="header" style={styles.title}>Resign this game?</Text>
      <Text style={styles.detail}>
        {opponentName} will immediately win. Accepted moves remain in the game record.
      </Text>
      <View style={styles.actions}>
        <ConfirmationButton label="CONFIRM RESIGNATION" danger disabled={disabled} onPress={onConfirm} />
        <ConfirmationButton label="KEEP PLAYING" disabled={disabled} onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 10, borderWidth: 1, borderColor: lobbyColors.danger, borderRadius: 12, backgroundColor: "#2B101A", padding: 14 },
  title: { color: lobbyColors.danger, fontSize: 18, fontWeight: "900" },
  detail: { color: lobbyColors.text, lineHeight: 20 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  action: { minHeight: 44, justifyContent: "center", borderWidth: 1, borderColor: lobbyColors.cyan, borderRadius: 8, backgroundColor: lobbyColors.surfaceRaised, paddingHorizontal: 12 },
  dangerAction: { borderColor: lobbyColors.danger },
  actionText: { color: lobbyColors.cyan, fontSize: 11, fontWeight: "900", letterSpacing: 0.8 },
  dangerText: { color: lobbyColors.danger },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.62 },
});
