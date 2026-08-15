import { missingPublicEnv } from "@/src/lib/env";
import { supabase } from "@/src/lib/supabase";
import {
  chatMessageRecordSchema,
  chatPageSchema,
  conversationSummarySchema,
  markReadResultSchema,
} from "@/src/features/chat/schemas";
import type { ChatCursor } from "@/src/features/chat/types";

const CHAT_PAGE_SIZE = 30;
let chatChannelSequence = 0;

function requireSupabase() {
  if (!supabase) {
    throw new Error(`Missing Supabase configuration: ${missingPublicEnv.join(", ")}`);
  }
  return supabase;
}

export async function getConversationMessages(
  conversationId: string,
  cursor: ChatCursor | null,
) {
  const { data, error } = await requireSupabase().rpc("get_conversation_messages", {
    conversation_id: conversationId,
    before_created_at: cursor?.createdAt ?? null,
    before_message_id: cursor?.messageId ?? null,
    page_size: CHAT_PAGE_SIZE,
  });
  if (error) throw error;
  return chatPageSchema.parse(data);
}

export async function sendConversationMessage(
  conversationId: string,
  messageId: string,
  body: string,
) {
  const { data, error } = await requireSupabase().rpc("send_conversation_message", {
    conversation_id: conversationId,
    client_message_id: messageId,
    body,
  });
  if (error) throw error;
  return chatMessageRecordSchema.parse(data);
}

export async function markConversationRead(conversationId: string) {
  const { data, error } = await requireSupabase().rpc("mark_conversation_read", {
    conversation_id: conversationId,
  });
  if (error) throw error;
  return markReadResultSchema.parse(data);
}

export async function getConversationSummary(conversationId: string) {
  const { data, error } = await requireSupabase().rpc("get_my_conversation_summary", {
    conversation_id: conversationId,
  });
  if (error) throw error;
  return conversationSummarySchema.parse(data);
}

export function subscribeToConversationMessages(conversationId: string, onChange: () => void) {
  const client = requireSupabase();
  chatChannelSequence += 1;
  const channel = client
    .channel(`conversation-messages:${conversationId}:${chatChannelSequence}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      onChange,
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}
