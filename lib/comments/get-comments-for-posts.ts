import { createClient } from "@/utils/supabase/server";

import { COMMENT_SELECT, type Comment } from "./types";

export type CommentsContext = {
  commentsByPostId: Map<string, Comment[]>;
  markedCommentIds: Set<string>;
};

export async function getCommentsForPosts(
  postIds: string[],
  currentUserId: string
): Promise<CommentsContext> {
  const commentsByPostId = new Map<string, Comment[]>();
  const markedCommentIds = new Set<string>();

  if (postIds.length === 0) {
    return { commentsByPostId, markedCommentIds };
  }

  const supabase = await createClient();

  const { data: comments, error } = await supabase
    .from("comments")
    .select(COMMENT_SELECT)
    .in("post_id", postIds)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  for (const comment of (comments ?? []) as Comment[]) {
    const existing = commentsByPostId.get(comment.post_id) ?? [];
    existing.push(comment);
    commentsByPostId.set(comment.post_id, existing);
  }

  const commentIds = (comments ?? []).map((comment) => comment.id);

  if (commentIds.length > 0) {
    const { data: marks, error: marksError } = await supabase
      .from("helpful_marks")
      .select("target_id")
      .eq("target_type", "comment")
      .eq("marker_id", currentUserId)
      .in("target_id", commentIds);

    if (marksError) {
      throw new Error(marksError.message);
    }

    for (const mark of marks ?? []) {
      markedCommentIds.add(mark.target_id);
    }
  }

  return { commentsByPostId, markedCommentIds };
}
