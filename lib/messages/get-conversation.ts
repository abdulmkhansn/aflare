import { getOtherParticipantId, type ConversationRow, type MessageRow } from "@/lib/messages/types";
import { createClient } from "@/utils/supabase/server";

export type ConversationDetail = {
  conversation: ConversationRow;
  otherUser: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  messages: MessageRow[];
};

export async function getConversationDetail(
  conversationId: string,
  userId: string
): Promise<ConversationDetail | null> {
  const supabase = await createClient();

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id, user_a, user_b, updated_at")
    .eq("id", conversationId)
    .maybeSingle();

  if (conversationError) {
    throw new Error(conversationError.message);
  }

  if (!conversation) {
    return null;
  }

  if (conversation.user_a !== userId && conversation.user_b !== userId) {
    return null;
  }

  const otherUserId = getOtherParticipantId(conversation, userId);

  const [{ data: otherUser }, { data: messages, error: messagesError }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .eq("id", otherUserId)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("id, conversation_id, sender_id, body, read_at, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true }),
  ]);

  if (messagesError) {
    throw new Error(messagesError.message);
  }

  return {
    conversation: conversation as ConversationRow,
    otherUser: {
      id: otherUserId,
      displayName: otherUser?.display_name ?? null,
      avatarUrl: otherUser?.avatar_url ?? null,
    },
    messages: (messages ?? []) as MessageRow[],
  };
}
