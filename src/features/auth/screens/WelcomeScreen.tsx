import { router, type Href } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { Screen } from "@/src/components/common/Screen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

export function WelcomeScreen() {
  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <AppText style={styles.eyebrow}>TWO FRIENDS. ONE QUEUE.</AppText>
        <AppText accessibilityRole="header" style={styles.brand}>DUOQUEUE</AppText>
        <AppText style={styles.tagline}>Your next friend group starts with two.</AppText>
        <View style={styles.signalRow} accessibilityElementsHidden>
          <View style={[styles.signal, styles.signalA]} />
          <View style={styles.connector} />
          <View style={[styles.signal, styles.signalB]} />
        </View>
        <AppText style={styles.description}>
          Meet another pair of friends together, then see where the group goes.
        </AppText>
      </View>
      <View style={styles.actions}>
        <AppButton label="Create account" onPress={() => router.push("/sign-up")} />
        <AppButton label="Sign in" onPress={() => router.push("/sign-in")} />
      </View>
      <AppText style={styles.notice}>Built for friendship, not dating. The current MVP is for adults aged 18 or older.</AppText>
      <View style={styles.actions}>
        <AppButton label="Community Guidelines" onPress={() => router.push("/legal/community-guidelines" as Href)} />
        <AppButton label="Privacy Policy" onPress={() => router.push("/legal/privacy" as Href)} />
        <AppButton label="Terms" onPress={() => router.push("/legal/terms" as Href)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 18, justifyContent: "center" },
  hero: { gap: 12, borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 18, backgroundColor: lobbyColors.surface, padding: 22 },
  eyebrow: { color: lobbyColors.magenta, fontSize: 12, fontWeight: "900", letterSpacing: 2 },
  brand: { color: lobbyColors.cyan, fontSize: 38, lineHeight: 44, letterSpacing: 4 },
  tagline: { color: lobbyColors.text, fontSize: 19, fontWeight: "800", lineHeight: 26 },
  description: { color: lobbyColors.muted },
  signalRow: { flexDirection: "row", alignItems: "center", width: 116 },
  signal: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  signalA: { borderColor: lobbyColors.memberA, backgroundColor: "#123758" },
  signalB: { borderColor: lobbyColors.memberB, backgroundColor: "#4A2A1C" },
  connector: { flex: 1, height: 2, backgroundColor: lobbyColors.magenta },
  actions: { gap: 10 },
  notice: { color: lobbyColors.muted, borderLeftWidth: 2, borderLeftColor: lobbyColors.magenta, paddingLeft: 12 },
});
