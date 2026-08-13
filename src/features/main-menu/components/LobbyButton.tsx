import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

type LobbyButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  detail?: string;
  variant?: "queue" | "menu";
  style?: StyleProp<ViewStyle>;
};

export function LobbyButton({
  label,
  detail,
  variant = "menu",
  disabled,
  style,
  onFocus,
  onBlur,
  ...props
}: LobbyButtonProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isQueue = variant === "queue";
  const unavailable = Boolean(disabled);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityHint={props.accessibilityHint ?? detail}
      accessibilityState={{ disabled: unavailable }}
      disabled={unavailable}
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setIsFocused(false);
        onBlur?.(event);
      }}
      {...props}
      style={({ pressed }) => [
        styles.base,
        isQueue && styles.queue,
        !isQueue && styles.menu,
        pressed && styles.pressed,
        isFocused && styles.focused,
        unavailable && styles.disabled,
        style,
      ]}
    >
      <View style={styles.textGroup}>
        <Text style={[styles.label, isQueue && styles.queueLabel]}>{label}</Text>
        {detail && <Text style={[styles.detail, isQueue && styles.queueDetail]}>{detail}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  queue: {
    width: 220,
    minHeight: 220,
    alignSelf: "center",
    borderRadius: 110,
    borderColor: lobbyColors.cyan,
    backgroundColor: "#0A2840",
    shadowColor: lobbyColors.cyan,
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
    padding: 24,
  },
  menu: {
    flex: 1,
    minWidth: 0,
    minHeight: 92,
    borderRadius: 12,
    borderColor: lobbyColors.border,
    backgroundColor: lobbyColors.surfaceRaised,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
  focused: { borderColor: lobbyColors.magenta, shadowColor: lobbyColors.magenta, shadowOpacity: 0.6, shadowRadius: 8 },
  disabled: { opacity: 0.45 },
  textGroup: { alignItems: "center", gap: 6 },
  label: {
    color: lobbyColors.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1.4,
    textAlign: "center",
  },
  queueLabel: { color: lobbyColors.cyan, fontSize: 30, letterSpacing: 3 },
  detail: { color: lobbyColors.muted, fontSize: 12, textAlign: "center" },
  queueDetail: { color: lobbyColors.text, fontSize: 13 },
});
