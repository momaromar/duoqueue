import { z } from "zod";

export const chatMessageRecordSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  kind: z.enum(["system", "text"]),
  body: z.string().min(1).max(1000),
  createdAt: z.string(),
  senderUserId: z.string().uuid().nullable(),
}).superRefine((message, context) => {
  if (message.kind === "text" && !message.senderUserId) {
    context.addIssue({ code: "custom", message: "Text messages require a sender." });
  }
  if (message.kind === "system" && message.senderUserId) {
    context.addIssue({ code: "custom", message: "System messages cannot have a sender." });
  }
});

export const chatPageSchema = z.object({
  items: z.array(chatMessageRecordSchema),
  nextCursor: z.object({
    createdAt: z.string(),
    messageId: z.string().uuid(),
  }).nullable(),
});

export const conversationSummarySchema = z.object({
  conversationId: z.string().uuid(),
  lastActivityAt: z.string(),
  lastReadAt: z.string().nullable(),
  unreadCount: z.number().int().nonnegative(),
  lastMessage: chatMessageRecordSchema.nullable(),
});

export const markReadResultSchema = z.object({
  lastReadAt: z.string(),
  unreadCount: z.literal(0),
});
