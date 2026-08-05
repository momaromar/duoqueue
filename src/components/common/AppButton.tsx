import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
} from "react-native";

import { AppText } from "@/src/components/common/AppText";
import { colors, radii, spacing } from "@/src/theme/tokens";

type ButtonVariant = "primary" | "secondary" | "text";

type AppButtonProps = Omit<PressableProps, "style" | "children"> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: ViewStyle;
};

export function AppButton({
  label,
  variant = "primary",
  loading = false,
  disabled,
  style,
  ...props
}: AppButtonProps) {
  const unavailable = disabled || loading;
  const labelColor = variant === "primary" ? "white" : "primary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityState={{ disabled: unavailable, busy: loading }}
      disabled={unavailable}
      {...props}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !unavailable && styles.pressed,
        unavailable && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.white : colors.primary} />
      ) : (
        <AppText variant="subtitle" color={labelColor}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
  },
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  text: { backgroundColor: "transparent", minHeight: 44 },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
});
