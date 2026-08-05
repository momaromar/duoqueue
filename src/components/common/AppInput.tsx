import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { AppText } from "@/src/components/common/AppText";
import { colors, radii, spacing } from "@/src/theme/tokens";

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
  ...props
}: AppInputProps) {
  return (
    <View style={styles.group}>
      <AppText style={styles.label}>{label}</AppText>
      <View style={[styles.inputShell, error ? styles.inputError : undefined]}>
        <TextInput
          accessibilityLabel={props.accessibilityLabel ?? label}
          placeholderTextColor={colors.textMuted}
          {...props}
          style={[styles.input, style]}
        />
        {rightAccessory}
      </View>
      {error ? (
        <AppText color="error" variant="caption" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.xs },
  label: { fontWeight: "600" },
  inputShell: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.error },
  input: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
});
