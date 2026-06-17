import { getBlockedUserIds } from "@/lib/messages/blocks";
import {
  getOtherParticipantId,
  type InboxItem,
  type MessageRow,
} from "@/lib/messages/types";
import { createClient } from "@/utils/supabase/server";

export async function getInbox(userId: string): Promise<InboxItem[]> {
  const supabase = await createClient();

  const [{ data: conversations, error: conversationsError }, blockedIds] = await Promise.all([
    supabase
      .from("conversations")
      .select("id, user_a, user_b, updated_at")
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .order("updated_at", { ascending: false }),
    getBlockedUserIds(userId),
  ]);

  if (conversationsError) {
    throw new Error(conversationsError.message);
  }

  const visible = (conversations ?? []).filter((conversation) => {
    const otherUserId = getOtherParticipantId(conversation, userId);
    return !blockedIds.has(otherUserId);
  });

  if (visible.length === 0) {
    return [];
  }

  const conversationIds = visible.map((conversation) => conversation.id);
  const otherUserIds = visible.map((conversation) =>
    getOtherParticipantId(conversation, userId)
  );

  const [{ data: profiles }, { data: messages }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", otherUserIds),
    supabase
      .from("messages")
      .select("id, conversation_id, body, created_at, sender_id, read_at")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false }),
  ]);

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const lastMessageByConversation = new Map<string, MessageRow>();

  for (const message of messages ?? []) {
    if (!lastMessageByConversation.has(message.conversation_id)) {
      lastMessageByConversation.set(message.conversation_id, message as MessageRow);
    }
  }

  const unreadByConversation = new Map<string, number>();

  for (const message of messages ?? []) {
    if (message.sender_id !== userId && !message.read_at) {
      unreadByConversation.set(
        message.conversation_id,
        (unreadByConversation.get(message.conversation_id) ?? 0) + 1
      );
    }
  }

  return visible.map((conversation) => {
    const otherUserId = getOtherParticipantId(conversation, userId);
    const profile = profileById.get(otherUserId);
    const lastMessage = lastMessageByConversation.get(conversation.id);

    return {
      conversationId: conversation.id,
      otherUserId,
      displayName: profile?.display_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      lastMessageBody: lastMessage?.body ?? null,
      lastMessageAt: lastMessage?.created_at ?? conversation.updated_at,
      unreadCount: unreadByConversation.get(conversation.id) ?? 0,
    };
  });
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const blockedIds = await getBlockedUserIds(userId);

  const { data: conversations, error: conversationsError } = await supabase
    .from("conversations")
    .select("id, user_a, user_b")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);

  if (conversationsError) {
    throw new Error(conversationsError.message);
  }

  const visibleConversationIds = (conversations ?? [])
    .filter((conversation) => !blockedIds.has(getOtherParticipantId(conversation, userId)))
    .map((conversation) => conversation.id);

  if (visibleConversationIds.length === 0) {
    return 0;
  }

  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", visibleConversationIds)
    .neq("sender_id", userId)
    .is("read_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
