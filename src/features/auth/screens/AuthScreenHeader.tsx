import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

type AuthScreenHeaderProps = { title: string; description: string };

export function AuthScreenHeader({ title, description }: AuthScreenHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <AppButton label="← BACK" style={styles.back} onPress={() => router.back()} />
      <AppText style={styles.eyebrow}>DUOQUEUE // ACCESS</AppText>
      <AppText accessibilityRole="header" style={styles.title}>{title}</AppText>
      <AppText style={styles.description}>{description}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  back: { alignSelf: "flex-start", minHeight: 44, paddingHorizontal: 14, paddingVertical: 8 },
  eyebrow: { color: lobbyColors.magenta, fontSize: 12, fontWeight: "900", letterSpacing: 2 },
  title: { fontSize: 32, lineHeight: 38 },
  description: { color: lobbyColors.muted, fontSize: 16, lineHeight: 23 },
});
