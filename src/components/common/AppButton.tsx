import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { AppText } from "@/src/components/common/AppText";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

type AppButtonProps = Omit<PressableProps, "style" | "children"> & {
  label: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  label,
  loading = false,
  disabled,
  style,
  ...props
}: AppButtonProps) {
  const unavailable = disabled || loading;
  let content = <AppText style={styles.label}>{label}</AppText>;

  if (loading) {
    content = <ActivityIndicator color={lobbyColors.cyan} />;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityState={{ disabled: unavailable, busy: loading }}
      disabled={unavailable}
      {...props}
      style={({ pressed }) => [
        styles.base,
        pressed && !unavailable && styles.pressed,
        unavailable && styles.disabled,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: lobbyColors.border,
    borderRadius: 12,
    backgroundColor: lobbyColors.surfaceRaised,
    shadowColor: lobbyColors.cyan,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  label: {
    color: lobbyColors.text,
    fontWeight: "800",
    letterSpacing: 1.1,
    textAlign: "center",
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
});
