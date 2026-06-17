export type ConversationRow = {
  id: string;
  user_a: string;
  user_b: string;
  updated_at: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type InboxItem = {
  conversationId: string;
  otherUserId: string;
  displayName: string | null;
  avatarUrl: string | null;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export function orderedUserPair(userId: string, otherUserId: string): [string, string] {
  return userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];
}

export function getOtherParticipantId(
  conversation: Pick<ConversationRow, "user_a" | "user_b">,
  userId: string
): string {
  return conversation.user_a === userId ? conversation.user_b : conversation.user_a;
}
