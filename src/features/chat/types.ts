export type ChatDeliveryStatus = "pending" | "sent" | "failed";

export type ChatParticipant = {
  userId: string;
  displayName: string;
  duoId: string;
  duoName: string;
  side: "own" | "opponent";
};

export type ChatSystemMessage = {
  id: string;
  kind: "system";
  body: string;
  createdAt: string;
};

export type ChatTextMessage = {
  id: string;
  kind: "text";
  body: string;
  createdAt: string;
  sender: ChatParticipant;
  deliveryStatus: ChatDeliveryStatus;
  failureReason: string | null;
};

export type ChatMessage = ChatSystemMessage | ChatTextMessage;

export type ChatMessageRecord = {
  id: string;
  conversationId: string;
  kind: "system" | "text";
  body: string;
  createdAt: string;
  senderUserId: string | null;
};

export type ChatCursor = { createdAt: string; messageId: string };
export type ChatPage = { items: ChatMessageRecord[]; nextCursor: ChatCursor | null };

export type ConversationSummary = {
  conversationId: string;
  lastActivityAt: string;
  lastReadAt: string | null;
  unreadCount: number;
  lastMessage: ChatMessageRecord | null;
};

export type ChatOutboxMessage = ChatTextMessage & { conversationId: string };
