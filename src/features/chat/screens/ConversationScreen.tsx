import { useIsFocused } from "@react-navigation/native";
import { Redirect, router, useFocusEffect, useLocalSearchParams, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { ChatHeader } from "@/src/features/chat/components/ChatHeader";
import { MessageComposer } from "@/src/features/chat/components/MessageComposer";
import { MessageList } from "@/src/features/chat/components/MessageList";
import {
  useConversationMessages,
  useConversationRealtime,
  useMarkConversationRead,
} from "@/src/features/chat/useChat";
import { useChatParticipants } from "@/src/features/chat/useChatParticipants";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import {
  MatchmakingDuoGate,
  type MatchmakingGateData,
} from "@/src/features/matchmaking/components/MatchmakingDuoGate";
import { SafetyActions } from "@/src/features/safety/components/SafetyActions";

export function ConversationScreen() {
  const params = useLocalSearchParams<{ conversationId?: string | string[] }>();
  let conversationId: string | undefined;
  if (typeof params.conversationId === "string") conversationId = params.conversationId;

  return (
    <MatchmakingDuoGate>
      {(data) => <ConversationGate {...data} routeConversationId={conversationId} />}
    </MatchmakingDuoGate>
  );
}

function ConversationGate({ profile, matchmaking, routeConversationId }: MatchmakingGateData & { routeConversationId: string | undefined }) {
  const match = matchmaking.match;
  if (!match || matchmaking.status !== "matched") return <Redirect href="/(app)/duo-chats" />;
  if (!routeConversationId || routeConversationId !== match.conversationId) {
    return <Redirect href="/(app)/duo-chats" />;
  }
  return <AuthorizedConversation profile={profile} match={match} />;
}

type AuthorizedConversationProps = {
  profile: MatchmakingGateData["profile"];
  match: NonNullable<MatchmakingGateData["matchmaking"]["match"]>;
};

function AuthorizedConversation({ profile, match }: AuthorizedConversationProps) {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const { currentParticipant, participants } = useChatParticipants(user?.id, profile, match);
  const { messagesQuery, messages, send, retry } = useConversationMessages(
    user?.id,
    match.conversationId,
    participants,
  );
  const readMutation = useMarkConversationRead(user?.id, match.conversationId);
  const { markRead } = readMutation;
  const refetchMessages = messagesQuery.refetch;
  const lastMarkedMessageId = useRef<string | null>(null);
  const [showSafety, setShowSafety] = useState(false);
  const latestIncomingMessage = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message.kind === "text" && message.sender.userId !== user?.id) return message;
    }
    return null;
  }, [messages, user?.id]);
  useConversationRealtime(user?.id, match.conversationId, isFocused);

  useFocusEffect(useCallback(() => {
    void refetchMessages();
    markRead();
  }, [markRead, refetchMessages]));

  useEffect(() => {
    if (!isFocused || !latestIncomingMessage) return;
    if (lastMarkedMessageId.current === latestIncomingMessage.id) return;
    lastMarkedMessageId.current = latestIncomingMessage.id;
    markRead();
  }, [isFocused, latestIncomingMessage, markRead]);

  if (!user?.id || !currentParticipant) return <Redirect href="/(app)/duo-chats" />;
  if (messagesQuery.isPending) return <LoadingView label="Loading conversationâ€¦" />;
  if (messagesQuery.error) {
    return <DuoStateErrorScreen error={messagesQuery.error} onRetry={messagesQuery.refetch} />;
  }

  if (showSafety) {
    return (
      <LobbyScreen contentContainerStyle={styles.safetyScreen}>
        <LobbyHeader title="Conversation Safety" subtitle={`${profile.duo.name} × ${match.opponent.name}`} />
        <SafetyActions
          matchId={match.id}
          opponentDuoName={match.opponent.name}
          conversationId={match.conversationId}
        />
        <LobbyButton label="BACK TO CHAT" onPress={() => setShowSafety(false)} />
      </LobbyScreen>
    );
  }

  let keyboardBehavior: "padding" | undefined;
  if (Platform.OS === "ios") keyboardBehavior = "padding";

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={keyboardBehavior}>
        <ChatHeader
          ownDuoName={profile.duo.name}
          opponentDuoName={match.opponent.name}
          onOpenSafety={() => setShowSafety(true)}
          onOpenGamePreview={() => {
            const gamePreviewHref = `/game/${match.conversationId}` as Href;
            router.push(gamePreviewHref);
          }}
        />
        <View style={styles.list}>
          <MessageList
            messages={messages}
            currentUserId={user.id}
            hasOlder={Boolean(messagesQuery.hasNextPage)}
            isLoadingOlder={messagesQuery.isFetchingNextPage}
            onLoadOlder={() => {
              if (messagesQuery.hasNextPage && !messagesQuery.isFetching) {
                void messagesQuery.fetchNextPage();
              }
            }}
            onRetry={retry}
          />
        </View>
        <MessageComposer onSend={(body) => send(body, currentParticipant)} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: lobbyColors.background },
  keyboard: { flex: 1 },
  list: { flex: 1 },
  safetyScreen: { gap: 16 },
});
