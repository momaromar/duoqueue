import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AppText } from "@/src/components/common/AppText";

export function LoadingView({ label = "Loading…" }: { label?: string }) {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <ActivityIndicator />
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
  },
});
