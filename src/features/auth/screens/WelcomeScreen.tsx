import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { Screen } from "@/src/components/common/Screen";
import { colors, radii, shadows, spacing } from "@/src/theme/tokens";

export function WelcomeScreen() {
  return (
    <Screen contentContainerStyle={styles.screen}>
      <View style={styles.top}>
        <View style={styles.wordmarkRow}>
          <View style={styles.mark}>
            <View style={[styles.dot, styles.dotOne]} />
            <View style={[styles.dot, styles.dotTwo]} />
            <View style={[styles.dot, styles.dotThree]} />
            <View style={[styles.dot, styles.dotFour]} />
          </View>
          <AppText variant="subtitle">DuoQueue</AppText>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.pairs}>
            <View style={[styles.person, styles.personPrimary]}>
              <AppText color="white" variant="subtitle">A</AppText>
            </View>
            <View style={[styles.person, styles.personAccent]}>
              <AppText color="white" variant="subtitle">B</AppText>
            </View>
            <AppText variant="title" color="primary">+</AppText>
            <View style={[styles.person, styles.personSoft]}>
              <AppText color="primary" variant="subtitle">C</AppText>
            </View>
            <View style={[styles.person, styles.personDark]}>
              <AppText color="white" variant="subtitle">D</AppText>
            </View>
          </View>
        </View>

        <View style={styles.copy}>
          <AppText variant="display">Your next friend group starts with two.</AppText>
          <AppText color="textMuted" variant="subtitle">
            Meet another pair of friends together, then see where the group goes.
          </AppText>
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton label="Create account" onPress={() => router.push("/sign-up")} />
        <AppButton
          label="Sign in"
          variant="secondary"
          onPress={() => router.push("/sign-in")}
        />
        <AppText variant="caption" color="textMuted" style={styles.clarification}>
          Built for friendship, not dating. Terms & Privacy pages are coming soon.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: "space-between", gap: spacing.lg },
  top: { gap: spacing.xl },
  wordmarkRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  mark: { width: 30, height: 30, position: "relative" },
  dot: { width: 13, height: 13, borderRadius: radii.pill, position: "absolute" },
  dotOne: { left: 0, top: 0, backgroundColor: colors.primary },
  dotTwo: { right: 0, top: 0, backgroundColor: colors.accent },
  dotThree: { left: 0, bottom: 0, backgroundColor: colors.accent },
  dotFour: { right: 0, bottom: 0, backgroundColor: colors.primary },
  heroCard: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
    ...shadows,
  },
  pairs: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  person: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.white,
  },
  personPrimary: { backgroundColor: colors.primary, marginRight: -18 },
  personAccent: { backgroundColor: colors.accent },
  personSoft: { backgroundColor: colors.surface, marginRight: -18 },
  personDark: { backgroundColor: colors.text },
  copy: { gap: spacing.md },
  actions: { gap: spacing.sm },
  clarification: { textAlign: "center", marginTop: spacing.xs },
});
