import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

export type LegalSection = { heading: string; body: string };

export function LegalScreen({ title, subtitle, sections }: { title: string; subtitle: string; sections: LegalSection[] }) {
  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader showBack title={title} subtitle={subtitle} />
      <View style={styles.warning}>
        <Text style={styles.warningTitle}>DEVELOPMENT COPY — LEGAL REVIEW REQUIRED</Text>
        <Text style={styles.copy}>This page describes current product intent and is not production-approved legal text.</Text>
      </View>
      {sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={styles.heading}>{section.heading}</Text>
          <Text style={styles.copy}>{section.body}</Text>
        </View>
      ))}
      <LobbyButton label="BACK" onPress={() => router.back()} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
  warning: { gap: 7, borderWidth: 1, borderColor: lobbyColors.danger, borderRadius: 12, backgroundColor: "#2B101A", padding: 14 },
  warningTitle: { color: lobbyColors.danger, fontWeight: "900", letterSpacing: 1.2 },
  section: { gap: 7, borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 12, backgroundColor: lobbyColors.surface, padding: 14 },
  heading: { color: lobbyColors.cyan, fontSize: 17, fontWeight: "900" },
  copy: { color: lobbyColors.text, lineHeight: 21 },
});
