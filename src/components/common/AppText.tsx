import { StyleSheet, Text, type TextProps } from "react-native";

import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

export function AppText({ accessibilityRole, style, ...props }: TextProps) {
  return (
    <Text
      accessibilityRole={accessibilityRole}
      {...props}
      style={[styles.base, accessibilityRole === "header" && styles.header, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { color: lobbyColors.text, fontSize: 15, lineHeight: 21 },
  header: { color: lobbyColors.text, fontSize: 28, fontWeight: "900", letterSpacing: 0.6, lineHeight: 34 },
});
