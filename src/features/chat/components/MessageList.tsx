import { useEffect, useRef } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { MessageBubble } from "@/src/features/chat/components/MessageBubble";
import {
  SystemMessage,
  type SystemMessageAction,
} from "@/src/features/chat/components/SystemMessage";
import type { ChatMessage } from "@/src/features/chat/types";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

type MessageListProps = {
  messages: ChatMessage[];
  currentUserId: string;
  hasOlder: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
  onRetry: (messageId: string) => void;
  systemMessageAction?: SystemMessageAction;
};

export function MessageList({
  messages,
  currentUserId,
  hasOlder,
  isLoadingOlder,
  onLoadOlder,
  onRetry,
  systemMessageAction,
}: MessageListProps) {
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const previousLatestId = useRef<string | null>(null);
  const shouldScrollToEnd = useRef(false);
  const latestId = messages.at(-1)?.id ?? null;

  useEffect(() => {
    if (!latestId || previousLatestId.current === latestId) return;
    previousLatestId.current = latestId;
    shouldScrollToEnd.current = true;
  }, [latestId]);

  let listHeader = (
    <View style={styles.start}><Text style={styles.startText}>START OF CONVERSATION</Text></View>
  );
  if (hasOlder) {
    let loadingLabel = "LOAD EARLIER MESSAGES";
    if (isLoadingOlder) loadingLabel = "LOADINGâ€¦";
    listHeader = (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: isLoadingOlder, disabled: isLoadingOlder }}
        disabled={isLoadingOlder}
        onPress={onLoadOlder}
        style={({ pressed }) => [styles.loadOlder, pressed && styles.pressed]}
      >
        <Text style={styles.loadOlderText}>{loadingLabel}</Text>
      </Pressable>
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(message) => message.id}
      renderItem={({ item }) => {
        if (item.kind === "system") {
          let action: SystemMessageAction | undefined;
          if (systemMessageAction?.messageId === item.id) action = systemMessageAction;
          return <SystemMessage message={item} action={action} />;
        }
        return <MessageBubble message={item} currentUserId={currentUserId} onRetry={onRetry} />;
      }}
      ListHeaderComponent={listHeader}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      initialNumToRender={10}
      maxToRenderPerBatch={12}
      windowSize={7}
      keyboardShouldPersistTaps="handled"
      maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
      onContentSizeChange={() => {
        if (!shouldScrollToEnd.current) return;
        shouldScrollToEnd.current = false;
        listRef.current?.scrollToEnd({ animated: false });
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: { width: "100%", maxWidth: 720, alignSelf: "center", paddingHorizontal: 14, paddingVertical: 14 },
  separator: { height: 10 },
  loadOlder: { alignSelf: "center", minHeight: 44, justifyContent: "center", marginBottom: 10, paddingHorizontal: 12 },
  loadOlderText: { color: lobbyColors.cyan, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  start: { alignItems: "center", marginBottom: 10 },
  startText: { color: lobbyColors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  pressed: { opacity: 0.6 },
});
