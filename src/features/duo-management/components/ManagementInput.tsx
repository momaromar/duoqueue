import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

type ManagementInputProps = TextInputProps & { label: string; error?: string };

export function ManagementInput({ label, error, style, ...props }: ManagementInputProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={props.accessibilityLabel ?? label}
        placeholderTextColor={lobbyColors.muted}
        {...props}
        style={[styles.input, props.multiline && styles.multiline, style]}
      />
      {error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  label: { color: lobbyColors.text, fontWeight: "800" },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: lobbyColors.border,
    borderRadius: 10,
    backgroundColor: lobbyColors.surface,
    color: lobbyColors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  multiline: { minHeight: 96, textAlignVertical: "top" },
  error: { color: lobbyColors.danger, lineHeight: 19 },
});
