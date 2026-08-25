import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ChatSystemMessage } from "@/src/features/chat/types";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

export type SystemMessageAction = {
  messageId: string;
  label: string;
  disabled: boolean;
  busy?: boolean;
  error?: string | null;
  onPress?: () => void;
};

export function SystemMessage({
  message,
  action,
}: {
  message: ChatSystemMessage;
  action?: SystemMessageAction;
}) {
  return (
    <View style={styles.wrapper} accessibilityLabel={`System message: ${message.body}`}>
      <Text style={styles.label}>MATCH SYSTEM</Text>
      <Text style={styles.body}>{message.body}</Text>
      {action && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={action.label}
            accessibilityState={{ disabled: action.disabled, busy: action.busy }}
            disabled={action.disabled}
            onPress={action.onPress}
            style={({ pressed }) => [
              styles.action,
              action.disabled && styles.actionDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
          {action.error && (
            <Text accessibilityLiveRegion="polite" style={styles.error}>{action.error}</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignSelf: "center", maxWidth: 560, gap: 4, borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 10, backgroundColor: lobbyColors.surface, paddingHorizontal: 14, paddingVertical: 9 },
  label: { color: lobbyColors.magenta, fontSize: 10, fontWeight: "900", letterSpacing: 1.5, textAlign: "center" },
  body: { color: lobbyColors.muted, fontSize: 12, lineHeight: 17, textAlign: "center" },
  action: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: lobbyColors.cyan,
    borderRadius: 8,
    backgroundColor: "#0A2840",
    paddingHorizontal: 14,
  },
  actionText: { color: lobbyColors.cyan, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  actionDisabled: { borderColor: lobbyColors.border, opacity: 0.62 },
  error: { color: lobbyColors.danger, fontSize: 12, lineHeight: 17, textAlign: "center" },
  pressed: { opacity: 0.62 },
});
