import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { AppText } from "@/src/components/common/AppText";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

export type AppInputProps = TextInputProps & {
  label: string;
  error?: string;
  rightAccessory?: React.ReactNode;
};

export function AppInput({
  label,
  error,
  rightAccessory,
  style,
  placeholderTextColor = lobbyColors.muted,
  selectionColor = lobbyColors.cyan,
  ...props
}: AppInputProps) {
  let errorMessage: React.ReactNode;

  if (error) {
    errorMessage = (
      <AppText accessibilityLiveRegion="polite" style={styles.error}>{error}</AppText>
    );
  }

  return (
    <View style={styles.group}>
      <AppText style={styles.label}>{label}</AppText>
      <View style={[styles.inputShell, error && styles.inputError]}>
        <TextInput
          accessibilityLabel={props.accessibilityLabel ?? label}
          placeholderTextColor={placeholderTextColor}
          selectionColor={selectionColor}
          {...props}
          style={[styles.input, style]}
        />
        {rightAccessory}
      </View>
      {errorMessage}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 7 },
  label: { color: lobbyColors.text, fontWeight: "800", letterSpacing: 0.3 },
  inputShell: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: lobbyColors.border,
    borderRadius: 10,
    backgroundColor: lobbyColors.surface,
  },
  inputError: { borderColor: lobbyColors.danger },
  input: {
    flex: 1,
    minHeight: 48,
    color: lobbyColors.text,
    paddingHorizontal: 12,
  },
  error: { color: lobbyColors.danger, fontSize: 13 },
});
