import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

export function DuoChatsScreen() {
  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader
        showBack
        title="Duo Chats"
        subtitle="Conversations with matched duos will live here."
      />
      <View style={styles.emptyState}>
        <Text style={styles.emptyCode}>NO ACTIVE CHANNELS</Text>
        <Text style={styles.emptyTitle}>Your chat list is empty</Text>
        <Text style={styles.emptyCopy}>
          Duo conversations become available after matchmaking. Queue and chat functionality
          are planned for later phases.
        </Text>
      </View>
      <LobbyButton label="BACK TO LOBBY" onPress={() => router.back()} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 24 },
  emptyState: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: lobbyColors.border,
    borderRadius: 14,
    backgroundColor: lobbyColors.surface,
    padding: 24,
  },
  emptyCode: { color: lobbyColors.magenta, fontWeight: "900", letterSpacing: 2 },
  emptyTitle: { color: lobbyColors.text, fontSize: 22, fontWeight: "800", textAlign: "center" },
  emptyCopy: { color: lobbyColors.muted, lineHeight: 21, textAlign: "center", maxWidth: 440 },
});
