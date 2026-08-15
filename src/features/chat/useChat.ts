import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { AppState } from "react-native";

import {
  getConversationMessages,
  getConversationSummary,
  markConversationRead,
  sendConversationMessage,
  subscribeToConversationMessages,
} from "@/src/features/chat/chatService";
import type {
  ChatCursor,
  ChatMessage,
  ChatMessageRecord,
  ChatOutboxMessage,
  ChatParticipant,
  ConversationSummary,
} from "@/src/features/chat/types";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function chatMessagesKey(userId: string | undefined, conversationId: string | undefined) {
  return ["chat", "messages", userId, conversationId] as const;
}

export function chatSummaryKey(userId: string | undefined, conversationId: string | undefined) {
  return ["chat", "summary", userId, conversationId] as const;
}

function chatOutboxKey(userId: string | undefined, conversationId: string | undefined) {
  return ["chat", "outbox", userId, conversationId] as const;
}

function compareMessages(left: ChatMessage, right: ChatMessage) {
  const timeDifference = Date.parse(left.createdAt) - Date.parse(right.createdAt);
  if (timeDifference !== 0) return timeDifference;
  return left.id.localeCompare(right.id);
}

function messageForDisplay(
  record: ChatMessageRecord,
  participantsById: Map<string, ChatParticipant>,
): ChatMessage {
  if (record.kind === "system") {
    return { id: record.id, kind: "system", body: record.body, createdAt: record.createdAt };
  }

  const sender = participantsById.get(record.senderUserId ?? "");
  if (!sender) {
    throw new Error("A saved message sender is not part of this active match.");
  }
  return {
    id: record.id,
    kind: "text",
    body: record.body,
    createdAt: record.createdAt,
    sender,
    deliveryStatus: "sent",
    failureReason: null,
  };
}

export function useConversationMessages(
  userId: string | undefined,
  conversationId: string | undefined,
  participants: ChatParticipant[],
) {
  const queryClient = useQueryClient();
  const enabled = Boolean(userId && conversationId);
  const messagesQuery = useInfiniteQuery({
    queryKey: chatMessagesKey(userId, conversationId),
    queryFn: ({ pageParam }) => getConversationMessages(conversationId!, pageParam),
    initialPageParam: null as ChatCursor | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  });
  const outboxQuery = useQuery({
    queryKey: chatOutboxKey(userId, conversationId),
    queryFn: async () => [] as ChatOutboxMessage[],
    initialData: [] as ChatOutboxMessage[],
    staleTime: Infinity,
    enabled: false,
  });
  const participantsById = useMemo(
    () => new Map(participants.map((participant) => [participant.userId, participant])),
    [participants],
  );
  const records = useMemo(
    () => messagesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [messagesQuery.data?.pages],
  );
  const serverIds = useMemo(() => new Set(records.map((record) => record.id)), [records]);

  useEffect(() => {
    if (serverIds.size === 0) return;
    queryClient.setQueryData<ChatOutboxMessage[]>(
      chatOutboxKey(userId, conversationId),
      (current = []) => current.filter((message) => !serverIds.has(message.id)),
    );
  }, [conversationId, queryClient, serverIds, userId]);

  type SendVariables = {
    id: string;
    body: string;
    createdAt: string;
    sender: ChatParticipant;
  };

  const sendMutation = useMutation({
    mutationKey: ["chat", "send", userId, conversationId],
    mutationFn: (variables: SendVariables) => sendConversationMessage(
      conversationId!,
      variables.id,
      variables.body,
    ),
    onMutate: (variables) => {
      queryClient.setQueryData<ChatOutboxMessage[]>(
        chatOutboxKey(userId, conversationId),
        (current = []) => {
          const pending: ChatOutboxMessage = {
            id: variables.id,
            conversationId: conversationId!,
            kind: "text",
            body: variables.body,
            createdAt: variables.createdAt,
            sender: variables.sender,
            deliveryStatus: "pending",
            failureReason: null,
          };
          const existingIndex = current.findIndex((message) => message.id === variables.id);
          if (existingIndex < 0) return [...current, pending];
          return current.map((message) => {
            if (message.id === variables.id) return pending;
            return message;
          });
        },
      );
    },
    onSuccess: (saved, variables) => {
      queryClient.setQueryData<ChatOutboxMessage[]>(
        chatOutboxKey(userId, conversationId),
        (current = []) => current.map((message) => {
          if (message.id !== variables.id) return message;
          return {
            ...message,
            body: saved.body,
            createdAt: saved.createdAt,
            deliveryStatus: "sent",
            failureReason: null,
          };
        }),
      );
      void queryClient.invalidateQueries({ queryKey: chatMessagesKey(userId, conversationId) });
      void queryClient.invalidateQueries({ queryKey: chatSummaryKey(userId, conversationId) });
    },
    onError: (error, variables) => {
      queryClient.setQueryData<ChatOutboxMessage[]>(
        chatOutboxKey(userId, conversationId),
        (current = []) => current.map((message) => {
          if (message.id !== variables.id) return message;
          return {
            ...message,
            deliveryStatus: "failed",
            failureReason: getErrorMessage(error),
          };
        }),
      );
    },
  });

  const send = useCallback((rawBody: string, sender: ChatParticipant) => {
    const body = rawBody.trim();
    if (!enabled || body.length < 1 || body.length > 1000) return;
    sendMutation.mutate({
      id: Crypto.randomUUID(),
      body,
      createdAt: new Date().toISOString(),
      sender,
    });
  }, [enabled, sendMutation]);

  const retry = useCallback((messageId: string) => {
    const message = queryClient
      .getQueryData<ChatOutboxMessage[]>(chatOutboxKey(userId, conversationId))
      ?.find((candidate) => candidate.id === messageId);
    if (!message || message.deliveryStatus !== "failed") return;
    sendMutation.mutate({
      id: message.id,
      body: message.body,
      createdAt: message.createdAt,
      sender: message.sender,
    });
  }, [conversationId, queryClient, sendMutation, userId]);

  const messages = useMemo(() => {
    const serverMessages = records.map((record) => messageForDisplay(record, participantsById));
    const optimisticMessages = outboxQuery.data.filter((message) => !serverIds.has(message.id));
    return [...serverMessages, ...optimisticMessages].sort(compareMessages);
  }, [outboxQuery.data, participantsById, records, serverIds]);

  return { messagesQuery, messages, send, retry };
}

export function useConversationSummary(
  userId: string | undefined,
  conversationId: string | undefined,
) {
  return useQuery({
    queryKey: chatSummaryKey(userId, conversationId),
    queryFn: () => getConversationSummary(conversationId!),
    enabled: Boolean(userId && conversationId),
  });
}

export function useConversationRealtime(
  userId: string | undefined,
  conversationId: string | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !userId || !conversationId) return;
    const refreshConversation = () => {
      void queryClient.invalidateQueries({ queryKey: chatMessagesKey(userId, conversationId) });
      void queryClient.invalidateQueries({ queryKey: chatSummaryKey(userId, conversationId) });
    };
    const unsubscribe = subscribeToConversationMessages(conversationId, refreshConversation);
    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") refreshConversation();
    });
    return () => {
      unsubscribe();
      appStateSubscription.remove();
    };
  }, [conversationId, enabled, queryClient, userId]);
}

export function useMarkConversationRead(
  userId: string | undefined,
  conversationId: string | undefined,
) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => markConversationRead(conversationId!),
    onSuccess: (result) => {
      queryClient.setQueryData<ConversationSummary>(
        chatSummaryKey(userId, conversationId),
        (current) => {
          if (!current) return current;
          return {
            ...current,
            lastReadAt: result.lastReadAt,
            unreadCount: 0,
          };
        },
      );
    },
  });
  const mutateRef = useRef(mutation.mutate);
  mutateRef.current = mutation.mutate;
  const markRead = useCallback(() => {
    if (userId && conversationId) mutateRef.current();
  }, [conversationId, userId]);
  return { ...mutation, markRead };
}
