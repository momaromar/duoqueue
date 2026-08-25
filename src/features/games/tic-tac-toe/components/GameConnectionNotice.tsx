import { Pressable, StyleSheet, Text, View } from "react-native";

import type { GameRealtimeConnectionStatus } from "@/src/features/games/tic-tac-toe/gameService";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

type GameConnectionNoticeProps = {
  status: GameRealtimeConnectionStatus;
  isRecovering: boolean;
  onReconnect: () => void;
};

export function GameConnectionNotice({ status, isRecovering, onReconnect }: GameConnectionNoticeProps) {
  if (status === "subscribed" && !isRecovering) return null;
  let title = "Connecting game updates";
  let detail = "Refreshing the authoritative game before enabling another action.";
  const isDisconnected = status === "disconnected" || status === "timed_out" || status === "channel_error";
  if (isDisconnected) {
    title = "Live updates interrupted";
    detail = "The last verified board is still visible. Reconnect and refresh before relying on newer moves.";
  }
  if (isRecovering) {
    title = "Refreshing game state";
    detail = "Checking the latest server-authoritative board and turn.";
  }
  return (
    <View style={styles.panel} accessibilityLiveRegion="polite" accessibilityRole="alert">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.detail}>{detail}</Text>
      {isDisconnected && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reconnect and refresh game"
          disabled={isRecovering}
          onPress={onReconnect}
          style={({ pressed }) => [styles.action, isRecovering && styles.disabled, pressed && styles.pressed]}
        >
          <Text style={styles.actionText}>RECONNECT AND REFRESH</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 6,
    borderWidth: 1,
    borderColor: lobbyColors.magenta,
    borderRadius: 10,
    backgroundColor: "#291638",
    padding: 14,
  },
  title: { color: lobbyColors.magenta, fontSize: 13, fontWeight: "900", letterSpacing: 0.8 },
  detail: { color: lobbyColors.text, fontSize: 13, lineHeight: 19 },
  action: {
    minHeight: 44,
    alignSelf: "flex-start",
    justifyContent: "center",
    marginTop: 4,
    borderWidth: 1,
    borderColor: lobbyColors.cyan,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  actionText: { color: lobbyColors.cyan, fontSize: 11, fontWeight: "900", letterSpacing: 0.8 },
  pressed: { opacity: 0.62 },
  disabled: { opacity: 0.45 },
});
