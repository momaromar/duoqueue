import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ChatTextMessage } from "@/src/features/chat/types";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

function timeLabel(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

type MessageBubbleProps = {
  message: ChatTextMessage;
  currentUserId: string;
  onRetry: (messageId: string) => void;
};

export function MessageBubble({ message, currentUserId, onRetry }: MessageBubbleProps) {
  const isOwn = message.sender.userId === currentUserId;
  let senderLabel = message.sender.displayName;
  if (isOwn) senderLabel = "You";
  let statusLabel = "";
  if (message.deliveryStatus === "pending") statusLabel = "Sending locallyâ€¦";
  if (message.deliveryStatus === "failed") {
    statusLabel = "Local send failed";
  }

  return (
    <View style={[styles.row, isOwn && styles.ownRow]}>
      <View style={[styles.bubble, isOwn && styles.ownBubble, message.deliveryStatus === "failed" && styles.failedBubble]}>
        <Text style={[styles.sender, isOwn && styles.ownSender]}>{senderLabel} Â· {message.sender.duoName}</Text>
        <Text style={styles.body}>{message.body}</Text>
        <View style={styles.meta}>
          <Text style={styles.time}>{timeLabel(message.createdAt)}</Text>
          {statusLabel && message.deliveryStatus === "pending" && <Text style={styles.pending}>{statusLabel}</Text>}
          {statusLabel && message.deliveryStatus === "failed" && <Text style={styles.failed}>{statusLabel}</Text>}
        </View>
        {message.deliveryStatus === "failed" && (
          <Pressable accessibilityRole="button" onPress={() => onRetry(message.id)} style={({ pressed }) => [styles.retry, pressed && styles.pressed]}>
            <Text style={styles.retryText}>RETRY</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: "flex-start" },
  ownRow: { alignItems: "flex-end" },
  bubble: { maxWidth: "84%", gap: 6, borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 14, borderBottomLeftRadius: 4, backgroundColor: lobbyColors.surface, padding: 12 },
  ownBubble: { borderColor: lobbyColors.cyan, borderBottomLeftRadius: 14, borderBottomRightRadius: 4, backgroundColor: "#0A2840" },
  failedBubble: { borderColor: lobbyColors.danger },
  sender: { color: lobbyColors.memberB, fontSize: 11, fontWeight: "900" },
  ownSender: { color: lobbyColors.cyan },
  body: { color: lobbyColors.text, fontSize: 15, lineHeight: 21 },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  time: { color: lobbyColors.muted, fontSize: 10 },
  pending: { color: lobbyColors.cyan, fontSize: 10 },
  failed: { color: lobbyColors.danger, fontSize: 10, fontWeight: "800" },
  retry: { alignSelf: "flex-end", minHeight: 34, justifyContent: "center", paddingHorizontal: 8 },
  retryText: { color: lobbyColors.danger, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  pressed: { opacity: 0.6 },
});
