import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { AppText } from "@/src/components/common/AppText";

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
  let content = <AppText>{label}</AppText>;

  if (loading) {
    content = <ActivityIndicator />;
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
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.5 },
});
