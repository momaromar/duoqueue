import { Pressable, StyleSheet, Text, View } from "react-native";

import { GAME_PRESETS, GAME_PRESET_KEYS } from "@/src/features/games/tic-tac-toe/presets";
import type { GameParticipant, GamePresetKey } from "@/src/features/games/tic-tac-toe/types";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

type GameSetupPanelProps = {
  selectedPreset: GamePresetKey;
  selectedOpponentId: string;
  opponents: GameParticipant[];
  onSelectPreset: (preset: GamePresetKey) => void;
  onSelectOpponent: (userId: string) => void;
  onCreateInvitation: () => void;
  isCreating?: boolean;
};

export function GameSetupPanel({
  selectedPreset,
  selectedOpponentId,
  opponents,
  onSelectPreset,
  onSelectOpponent,
  onCreateInvitation,
  isCreating = false,
}: GameSetupPanelProps) {
  let submitLabel = "SEND INVITATION";
  if (isCreating) submitLabel = "SENDING…";
  return (
    <View style={styles.panel}>
      <Text accessibilityRole="header" style={styles.title}>Start a game</Text>
      <Text style={styles.description}>Choose a fixed preset and one of the other conversation members.</Text>
      <Text style={styles.label}>PRESET</Text>
      <View style={styles.choiceGrid} accessibilityRole="radiogroup">
        {GAME_PRESET_KEYS.map((key) => {
          const selected = selectedPreset === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="radio"
              accessibilityLabel={GAME_PRESETS[key].label}
              accessibilityState={{ checked: selected }}
              onPress={() => onSelectPreset(key)}
              style={({ pressed }) => [styles.choice, selected && styles.selected, pressed && styles.pressed]}
            >
              <Text style={[styles.choiceText, selected && styles.selectedText]}>{GAME_PRESETS[key].label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.label}>OPPONENT</Text>
      <View style={styles.choiceGrid} accessibilityRole="radiogroup">
        {opponents.map((participant) => {
          const selected = selectedOpponentId === participant.userId;
          return (
            <Pressable
              key={participant.userId}
              accessibilityRole="radio"
              accessibilityLabel={`${participant.displayName}, ${participant.duoName}`}
              accessibilityState={{ checked: selected }}
              onPress={() => onSelectOpponent(participant.userId)}
              style={({ pressed }) => [styles.choice, selected && styles.selected, pressed && styles.pressed]}
            >
              <Text style={[styles.choiceText, selected && styles.selectedText]}>{participant.displayName}</Text>
              <Text style={styles.choiceDetail}>{participant.duoName}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send game invitation"
        accessibilityState={{ disabled: isCreating }}
        disabled={isCreating}
        onPress={onCreateInvitation}
        style={({ pressed }) => [styles.primary, isCreating && styles.disabled, pressed && styles.pressed]}
      >
        <Text style={styles.primaryText}>{submitLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 12,
    borderWidth: 1,
    borderColor: lobbyColors.border,
    borderRadius: 12,
    backgroundColor: lobbyColors.surface,
    padding: 16,
  },
  title: { color: lobbyColors.text, fontSize: 22, fontWeight: "900" },
  description: { color: lobbyColors.muted, fontSize: 14, lineHeight: 20 },
  label: { color: lobbyColors.green, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  choiceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: lobbyColors.border,
    borderRadius: 8,
    backgroundColor: lobbyColors.surfaceRaised,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  selected: { borderColor: lobbyColors.cyan, backgroundColor: "#10304A" },
  choiceText: { color: lobbyColors.muted, fontSize: 11, fontWeight: "800" },
  selectedText: { color: lobbyColors.cyan },
  choiceDetail: { color: lobbyColors.muted, fontSize: 9, marginTop: 2 },
  primary: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: lobbyColors.cyan,
    borderRadius: 10,
    backgroundColor: "#0A2840",
    paddingHorizontal: 16,
  },
  primaryText: { color: lobbyColors.cyan, fontWeight: "900", letterSpacing: 1.4 },
  pressed: { opacity: 0.62 },
  disabled: { opacity: 0.45 },
});
