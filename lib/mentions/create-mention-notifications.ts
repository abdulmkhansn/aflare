import { extractMentionedUserIds } from "@/lib/mentions/parse-mentions";
import { createAdminClient } from "@/utils/supabase/admin";

export type MentionNotificationContext = {
  actorId: string;
  postId?: string | null;
  commentId?: string | null;
  flareId?: string | null;
  flareCommentId?: string | null;
};

export async function createMentionNotifications(
  body: string,
  context: MentionNotificationContext
): Promise<void> {
  const admin = createAdminClient();

  if (!admin) {
    return;
  }

  const mentionedUserIds = [
    ...new Set(extractMentionedUserIds(body).filter((userId) => userId !== context.actorId)),
  ];

  if (mentionedUserIds.length === 0) {
    return;
  }

  const rows = mentionedUserIds.map((userId) => ({
    user_id: userId,
    actor_id: context.actorId,
    type: "mention" as const,
    post_id: context.postId ?? null,
    comment_id: context.commentId ?? null,
    flare_id: context.flareId ?? null,
    flare_comment_id: context.flareCommentId ?? null,
    read: false,
  }));

  const { error } = await admin.from("notifications").insert(rows);

  if (error) {
    console.error("Failed to create mention notifications:", error.message);
  }
}
