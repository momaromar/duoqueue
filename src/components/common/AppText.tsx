import { Text, type TextProps, StyleSheet } from "react-native";

import { colors, fontSizes } from "@/src/theme/tokens";

type TextVariant = "body" | "caption" | "subtitle" | "title" | "display";

type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: keyof typeof colors;
};

export function AppText({
  variant = "body",
  color = "text",
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[styles.base, styles[variant], { color: colors[color] }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { fontWeight: "400" },
  body: { fontSize: fontSizes.body, lineHeight: 24 },
  caption: { fontSize: fontSizes.caption, lineHeight: 18 },
  subtitle: { fontSize: fontSizes.subtitle, lineHeight: 26, fontWeight: "600" },
  title: { fontSize: fontSizes.title, lineHeight: 38, fontWeight: "700" },
  display: { fontSize: fontSizes.display, lineHeight: 50, fontWeight: "800" },
});
