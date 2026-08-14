export type ChatDeliveryStatus = "pending" | "sent" | "failed";

export type ChatParticipant = {
  userId: string;
  displayName: string;
  duoId: string;
  duoName: string;
  side: "own" | "opponent";
};

export type ChatScope = {
  userId: string;
  duoId: string;
  conversationId: string;
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
};

export type LocalChatMessage = ChatSystemMessage | ChatTextMessage;

export type ChatFixtureInput = {
  scope: ChatScope;
  participants: ChatParticipant[];
  matchedAt: string;
  ownDuoName: string;
  opponentDuoName: string;
};
