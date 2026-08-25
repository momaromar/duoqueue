import type { Ref } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GAME_PRESETS, GAME_PRESET_KEYS } from "@/src/features/games/tic-tac-toe/presets";
import type { GamePresetKey } from "@/src/features/games/tic-tac-toe/types";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

type GameSetupPanelProps = {
  selectedPreset: GamePresetKey;
  onSelectPreset: (preset: GamePresetKey) => void;
  onCreateInvitation: () => void;
  isCreating?: boolean;
  actionsDisabled?: boolean;
  focusRef?: Ref<Text>;
};

export function GameSetupPanel({
  selectedPreset,
  onSelectPreset,
  onCreateInvitation,
  isCreating = false,
  actionsDisabled = false,
  focusRef,
}: GameSetupPanelProps) {
  let submitLabel = "POST OPEN INVITATION";
  if (isCreating) submitLabel = "POSTING...";
  return (
    <View style={styles.panel}>
      <Text ref={focusRef} accessible accessibilityRole="header" style={styles.title}>Start a game</Text>
      <Text style={styles.description}>
        Choose a preset and post an open challenge. Either member of the other duo can join first.
      </Text>
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Post open game invitation"
        accessibilityState={{ disabled: isCreating || actionsDisabled }}
        disabled={isCreating || actionsDisabled}
        onPress={onCreateInvitation}
        style={({ pressed }) => [styles.primary, (isCreating || actionsDisabled) && styles.disabled, pressed && styles.pressed]}
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
