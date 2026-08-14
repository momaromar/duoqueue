import { create } from "zustand";

import { createLocalChatFixture } from "@/src/features/chat/localChatFixture";
import type {
  ChatFixtureInput,
  ChatParticipant,
  ChatScope,
  ChatTextMessage,
  LocalChatMessage,
} from "@/src/features/chat/types";

const LOCAL_SEND_DELAY_MS = 450;
let localMessageSequence = 0;

function scopeKey(scope: ChatScope) {
  return `${scope.userId}:${scope.duoId}:${scope.conversationId}`;
}

type LocalChatState = {
  activeScopeKey: string | null;
  messages: LocalChatMessage[];
  visibleCount: number;
  pageSize: number;
  unreadCount: number;
  failNextSend: boolean;
  initialize: (input: ChatFixtureInput) => void;
  reset: () => void;
  loadOlder: () => void;
  markRead: () => void;
  armNextFailure: () => void;
  send: (body: string, sender: ChatParticipant) => void;
  retry: (messageId: string) => void;
};

function resolveMessage(messageId: string, expectedScopeKey: string, failed: boolean) {
  useLocalChatStore.setState((state) => {
    if (state.activeScopeKey !== expectedScopeKey) return state;
    return {
      messages: state.messages.map((message) => {
        if (message.id !== messageId || message.kind !== "text") return message;
        let deliveryStatus: ChatTextMessage["deliveryStatus"] = "sent";
        if (failed) deliveryStatus = "failed";
        return { ...message, deliveryStatus };
      }),
    };
  });
}

export const useLocalChatStore = create<LocalChatState>((set, get) => ({
  activeScopeKey: null,
  messages: [],
  visibleCount: 0,
  pageSize: 8,
  unreadCount: 0,
  failNextSend: false,
  initialize: (input) => {
    const nextScopeKey = scopeKey(input.scope);
    if (get().activeScopeKey === nextScopeKey) return;
    const fixture = createLocalChatFixture(input);
    const unreadCount = fixture.messages
      .slice(-fixture.initialVisibleCount)
      .filter((message) => message.kind === "text" && message.sender.userId !== input.scope.userId)
      .length;
    set({
      activeScopeKey: nextScopeKey,
      messages: fixture.messages,
      visibleCount: fixture.initialVisibleCount,
      pageSize: fixture.pageSize,
      unreadCount,
      failNextSend: false,
    });
  },
  reset: () => set({
    activeScopeKey: null,
    messages: [],
    visibleCount: 0,
    pageSize: 8,
    unreadCount: 0,
    failNextSend: false,
  }),
  loadOlder: () => set((state) => ({
    visibleCount: Math.min(state.messages.length, state.visibleCount + state.pageSize),
  })),
  markRead: () => set({ unreadCount: 0 }),
  armNextFailure: () => set({ failNextSend: true }),
  send: (rawBody, sender) => {
    const body = rawBody.trim();
    const currentScopeKey = get().activeScopeKey;
    if (!body || body.length > 1000 || !currentScopeKey) return;
    localMessageSequence += 1;
    const message: ChatTextMessage = {
      id: `local-sent-${Date.now()}-${localMessageSequence}`,
      kind: "text",
      body,
      createdAt: new Date().toISOString(),
      sender,
      deliveryStatus: "pending",
    };
    const shouldFail = get().failNextSend;
    set((state) => ({
      messages: [...state.messages, message],
      visibleCount: state.visibleCount + 1,
      failNextSend: false,
    }));
    setTimeout(() => resolveMessage(message.id, currentScopeKey, shouldFail), LOCAL_SEND_DELAY_MS);
  },
  retry: (messageId) => {
    const currentScopeKey = get().activeScopeKey;
    if (!currentScopeKey) return;
    set((state) => ({
      messages: state.messages.map((message) => {
        if (message.id !== messageId || message.kind !== "text") return message;
        return { ...message, deliveryStatus: "pending" };
      }),
    }));
    setTimeout(() => resolveMessage(messageId, currentScopeKey, false), LOCAL_SEND_DELAY_MS);
  },
}));

export function latestLocalMessage(state: LocalChatState) {
  return state.messages.at(-1) ?? null;
}
