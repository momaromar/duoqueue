import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { Screen } from "@/src/components/common/Screen";

export function WelcomeScreen() {
  return (
    <Screen contentContainerStyle={styles.screen}>
      <AppText accessibilityRole="header">DuoQueue</AppText>
      <AppText>Your next friend group starts with two.</AppText>
      <AppText>
        Meet another pair of friends together, then see where the group goes.
      </AppText>
      <View style={styles.actions}>
        <AppButton label="Create account" onPress={() => router.push("/sign-up")} />
        <AppButton label="Sign in" onPress={() => router.push("/sign-in")} />
      </View>
      <AppText>
        Built for friendship, not dating. Terms &amp; Privacy pages are coming soon.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
  actions: { gap: 8 },
});
