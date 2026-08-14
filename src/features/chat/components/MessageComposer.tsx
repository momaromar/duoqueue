import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

const MAX_MESSAGE_LENGTH = 1000;

type MessageComposerProps = { onSend: (body: string) => void };

export function MessageComposer({ onSend }: MessageComposerProps) {
  const [body, setBody] = useState("");
  const trimmedBody = body.trim();
  const canSend = trimmedBody.length >= 1 && trimmedBody.length <= MAX_MESSAGE_LENGTH;

  const submit = () => {
    if (!canSend) return;
    onSend(trimmedBody);
    setBody("");
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputGroup}>
        <TextInput
          accessibilityLabel="Local chat message"
          value={body}
          onChangeText={setBody}
          placeholder="Write a local preview messageâ€¦"
          placeholderTextColor={lobbyColors.muted}
          multiline
          maxLength={MAX_MESSAGE_LENGTH}
          style={styles.input}
        />
        <Text style={styles.count}>{body.length}/{MAX_MESSAGE_LENGTH}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send local message"
        accessibilityState={{ disabled: !canSend }}
        disabled={!canSend}
        onPress={submit}
        style={({ pressed }) => [styles.send, pressed && styles.pressed, !canSend && styles.disabled]}
      >
        <Text style={styles.sendText}>SEND</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: "row", alignItems: "flex-end", gap: 10, borderTopWidth: 1, borderTopColor: lobbyColors.border, backgroundColor: lobbyColors.surface, paddingHorizontal: 12, paddingVertical: 10 },
  inputGroup: { flex: 1, gap: 3, borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 12, backgroundColor: lobbyColors.background, paddingHorizontal: 10, paddingVertical: 7 },
  input: { maxHeight: 120, minHeight: 34, color: lobbyColors.text, padding: 0, textAlignVertical: "top" },
  count: { color: lobbyColors.muted, fontSize: 9, textAlign: "right" },
  send: { minWidth: 76, minHeight: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: lobbyColors.cyan, borderRadius: 10, backgroundColor: "#0A2840", paddingHorizontal: 12 },
  sendText: { color: lobbyColors.cyan, fontWeight: "900", letterSpacing: 1.2 },
  pressed: { opacity: 0.65 },
  disabled: { opacity: 0.4 },
});
