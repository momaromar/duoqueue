import { Pressable, StyleSheet, Text, View } from "react-native";

import { getCallerRole } from "@/src/features/games/tic-tac-toe/fixtures";
import { getGamePreset } from "@/src/features/games/tic-tac-toe/presets";
import type { GameSnapshot } from "@/src/features/games/tic-tac-toe/types";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

type GameStatusPanelProps = {
  snapshot: GameSnapshot;
  viewerUserId: string;
  localHotSeat: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  onResign?: () => void;
  onRematch?: () => void;
  onReturnToSetup?: () => void;
};

function ActionButton({ label, danger, onPress }: { label: string; danger?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.action, danger && styles.dangerAction, pressed && styles.pressed]}
    >
      <Text style={[styles.actionText, danger && styles.dangerText]}>{label}</Text>
    </Pressable>
  );
}

export function getGameStatusCopy(snapshot: GameSnapshot, viewerUserId: string, localHotSeat: boolean) {
  const preset = getGamePreset(snapshot.presetKey);
  const role = getCallerRole(snapshot, viewerUserId);
  const nextPlayer = snapshot.players.find((player) => player.userId === snapshot.nextTurnUserId);
  const winner = snapshot.players.find((player) => player.userId === snapshot.winnerUserId);
  let title = preset.label;
  let detail = `Viewing as ${role.replace("_", " ")}.`;

  if (snapshot.status === "pending") {
    title = "Invitation pending";
    if (snapshot.previousGameId) title = "Rematch requested";
    detail = `${snapshot.challenger.displayName} challenged ${snapshot.invited.displayName} to ${preset.label}.`;
  }
  if (snapshot.status === "active") {
    title = `${nextPlayer?.mark ?? "X"}'s turn`;
    detail = `${nextPlayer?.displayName ?? "The next player"} places the next mark.`;
    if (localHotSeat) detail = `Local hot-seat: pass the device to ${nextPlayer?.displayName ?? "the next player"}.`;
  }
  if (snapshot.status === "won") {
    title = `${winner?.displayName ?? "A player"} won`;
    detail = `${winner?.mark ?? "The winning mark"} completed the highlighted line.`;
  }
  if (snapshot.status === "draw") {
    title = "Draw";
    detail = "The board is full and neither player completed a line.";
  }
  if (snapshot.status === "resigned") {
    title = `${winner?.displayName ?? "The remaining player"} won by resignation`;
    detail = "The other player resigned from this local preview game.";
  }
  if (snapshot.status === "declined") {
    title = "Invitation declined";
    detail = `${snapshot.invited.displayName} declined the local invitation.`;
  }
  if (snapshot.status === "cancelled") {
    title = "Invitation cancelled";
    detail = `${snapshot.challenger.displayName} cancelled the local invitation.`;
  }
  if (snapshot.status === "closed") {
    title = "Game unavailable";
    detail = "The conversation closed, so this game can no longer continue.";
  }
  return { title, detail, role };
}

export function GameStatusPanel({
  snapshot,
  viewerUserId,
  localHotSeat,
  onAccept,
  onDecline,
  onCancel,
  onResign,
  onRematch,
  onReturnToSetup,
}: GameStatusPanelProps) {
  const copy = getGameStatusCopy(snapshot, viewerUserId, localHotSeat);
  return (
    <View style={styles.panel} accessibilityLiveRegion="polite">
      <Text accessibilityRole="header" style={styles.title}>{copy.title}</Text>
      <Text style={styles.detail}>{copy.detail}</Text>
      <Text style={styles.role}>VIEWER ROLE: {copy.role.replace("_", " ").toUpperCase()}</Text>
      <View style={styles.actions}>
        {onAccept && <ActionButton label="ACCEPT LOCAL INVITE" onPress={onAccept} />}
        {onDecline && <ActionButton label="DECLINE" danger onPress={onDecline} />}
        {onCancel && <ActionButton label="CANCEL INVITE" danger onPress={onCancel} />}
        {onResign && <ActionButton label="RESIGN LOCAL GAME" danger onPress={onResign} />}
        {onRematch && <ActionButton label="REQUEST REMATCH" onPress={onRematch} />}
        {onReturnToSetup && <ActionButton label="RETURN TO SETUP" onPress={onReturnToSetup} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 8,
    borderWidth: 1,
    borderColor: lobbyColors.border,
    borderRadius: 12,
    backgroundColor: lobbyColors.surface,
    padding: 16,
  },
  title: { color: lobbyColors.text, fontSize: 22, fontWeight: "900" },
  detail: { color: lobbyColors.muted, fontSize: 14, lineHeight: 20 },
  role: { color: lobbyColors.green, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  action: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: lobbyColors.cyan,
    borderRadius: 8,
    backgroundColor: lobbyColors.surfaceRaised,
    paddingHorizontal: 12,
  },
  dangerAction: { borderColor: lobbyColors.danger },
  actionText: { color: lobbyColors.cyan, fontSize: 11, fontWeight: "900", letterSpacing: 0.8 },
  dangerText: { color: lobbyColors.danger },
  pressed: { opacity: 0.62 },
});
