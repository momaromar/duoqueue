import { StyleSheet, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { colors, radii, spacing } from "@/src/theme/tokens";

export function AuthenticatedHomeScreen() {
  const { signOut } = useAuth();

  return (
    <Screen contentContainerStyle={styles.screen}>
      <View style={styles.badge}>
        <AppText variant="caption" color="success">PROTECTED ROUTE</AppText>
      </View>
      <View style={styles.copy}>
        <AppText variant="title">You’re in.</AppText>
        <AppText color="textMuted" variant="subtitle">
          You’ve entered the authenticated portion of DuoQueue. Onboarding will be built in a future milestone.
        </AppText>
      </View>
      <AppButton label="Mock sign out" variant="secondary" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: "center", gap: spacing.xl },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  copy: { gap: spacing.md },
});
