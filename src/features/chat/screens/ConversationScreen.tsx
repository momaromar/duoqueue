import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/features/auth/AuthContext";
import { ChatHeader } from "@/src/features/chat/components/ChatHeader";
import { MessageComposer } from "@/src/features/chat/components/MessageComposer";
import { MessageList } from "@/src/features/chat/components/MessageList";
import { useLocalChatStore } from "@/src/features/chat/localChatStore";
import type { LocalChatMessage } from "@/src/features/chat/types";
import { useLocalChatSession } from "@/src/features/chat/useLocalChatSession";
import {
  MatchmakingDuoGate,
  type MatchmakingGateData,
} from "@/src/features/matchmaking/components/MatchmakingDuoGate";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

export function ConversationScreen() {
  const params = useLocalSearchParams<{ conversationId?: string | string[] }>();
  let conversationId: string | undefined;
  if (typeof params.conversationId === "string") conversationId = params.conversationId;

  return (
    <MatchmakingDuoGate>
      {(data) => <ConversationContent {...data} routeConversationId={conversationId} />}
    </MatchmakingDuoGate>
  );
}

function ConversationContent({ profile, matchmaking, routeConversationId }: MatchmakingGateData & { routeConversationId: string | undefined }) {
  const { user } = useAuth();
  const match = matchmaking.match;
  const allMessages = useLocalChatStore((state) => state.messages);
  const visibleCount = useLocalChatStore((state) => state.visibleCount);
  const messages = useMemo(
    () => allMessages.slice(-visibleCount),
    [allMessages, visibleCount],
  );
  const totalMessages = useLocalChatStore((state) => state.messages.length);
  const loadOlder = useLocalChatStore((state) => state.loadOlder);
  const markRead = useLocalChatStore((state) => state.markRead);
  const send = useLocalChatStore((state) => state.send);
  const retry = useLocalChatStore((state) => state.retry);
  const failNextSend = useLocalChatStore((state) => state.failNextSend);
  const armNextFailure = useLocalChatStore((state) => state.armNextFailure);

  if (!match || matchmaking.status !== "matched") return <Redirect href="/(app)/duo-chats" />;
  if (!routeConversationId || routeConversationId !== match.conversationId) {
    return <Redirect href="/(app)/duo-chats" />;
  }

  return (
    <InitializedConversation
      profile={profile}
      match={match}
      userId={user?.id}
      messages={messages}
      totalMessages={totalMessages}
      loadOlder={loadOlder}
      markRead={markRead}
      send={send}
      retry={retry}
      failNextSend={failNextSend}
      armNextFailure={armNextFailure}
    />
  );
}

type InitializedConversationProps = {
  profile: MatchmakingGateData["profile"];
  match: NonNullable<MatchmakingGateData["matchmaking"]["match"]>;
  userId: string | undefined;
  messages: LocalChatMessage[];
  totalMessages: number;
  loadOlder: () => void;
  markRead: () => void;
  send: ReturnType<typeof useLocalChatStore.getState>["send"];
  retry: (messageId: string) => void;
  failNextSend: boolean;
  armNextFailure: () => void;
};

function InitializedConversation(props: InitializedConversationProps) {
  const { currentParticipant } = useLocalChatSession(props.userId, props.profile, props.match);
  const { markRead } = props;
  let keyboardBehavior: "padding" | undefined;
  if (Platform.OS === "ios") keyboardBehavior = "padding";
  let devControlLabel = "DEV: FAIL NEXT LOCAL SEND";
  if (props.failNextSend) devControlLabel = "NEXT LOCAL SEND WILL FAIL";

  useEffect(() => {
    markRead();
  }, [markRead]);

  if (!props.userId || !currentParticipant) return <Redirect href="/(app)/duo-chats" />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={keyboardBehavior}>
        <ChatHeader ownDuoName={props.profile.duo.name} opponentDuoName={props.match.opponent.name} />
        <View style={styles.previewNotice}>
          <Text style={styles.previewText}>LOCAL ONLY Â· NOT SHARED Â· RESETS AFTER FULL RESTART</Text>
        </View>
        <View style={styles.list}>
          <MessageList
            messages={props.messages}
            currentUserId={props.userId}
            hasOlder={props.messages.length < props.totalMessages}
            onLoadOlder={props.loadOlder}
            onRetry={props.retry}
          />
        </View>
        {__DEV__ && (
          <Pressable
            accessibilityRole="button"
            onPress={props.armNextFailure}
            style={({ pressed }) => [styles.devControl, pressed && styles.pressed, props.failNextSend && styles.devControlArmed]}
          >
            <Text style={styles.devText}>{devControlLabel}</Text>
          </Pressable>
        )}
        <MessageComposer onSend={(body) => props.send(body, currentParticipant)} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: lobbyColors.background },
  keyboard: { flex: 1 },
  previewNotice: { borderBottomWidth: 1, borderBottomColor: lobbyColors.border, backgroundColor: "#24132D", paddingHorizontal: 12, paddingVertical: 6 },
  previewText: { color: lobbyColors.magenta, fontSize: 10, fontWeight: "900", letterSpacing: 1, textAlign: "center" },
  list: { flex: 1 },
  devControl: { minHeight: 36, alignItems: "center", justifyContent: "center", borderTopWidth: 1, borderTopColor: lobbyColors.border, backgroundColor: lobbyColors.surfaceRaised, paddingHorizontal: 10 },
  devControlArmed: { backgroundColor: "#3A1520" },
  devText: { color: lobbyColors.danger, fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  pressed: { opacity: 0.65 },
});
