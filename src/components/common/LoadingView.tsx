import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AppText } from "@/src/components/common/AppText";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

export function LoadingView({ label = "Loading…" }: { label?: string }) {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <ActivityIndicator color={lobbyColors.cyan} size="large" />
      <AppText>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: lobbyColors.background,
  },
});
