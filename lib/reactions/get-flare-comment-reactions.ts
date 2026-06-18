import { createClient } from "@/utils/supabase/server";

import { emptyReactionCounts, normalizeReactionType, type PostReactionType } from "./types";
import type { ReactionCounts } from "./types";
import type { FlareCommentReactionsContext } from "./get-flare-comment-reaction-bar-props";

export async function getFlareCommentReactionsForComments(
  commentIds: string[],
  currentUserId: string
): Promise<FlareCommentReactionsContext> {
  const countsByCommentId = new Map<string, ReactionCounts>();
  const userReactionByCommentId = new Map<string, PostReactionType | null>();

  for (const commentId of commentIds) {
    countsByCommentId.set(commentId, emptyReactionCounts());
    userReactionByCommentId.set(commentId, null);
  }

  if (commentIds.length === 0) {
    return { countsByCommentId, userReactionByCommentId };
  }

  const supabase = await createClient();

  const { data: reactions, error } = await supabase
    .from("flare_comment_reactions")
    .select("flare_comment_id, user_id, reaction")
    .in("flare_comment_id", commentIds);

  if (error) {
    throw new Error(error.message);
  }

  for (const row of reactions ?? []) {
    const reaction = normalizeReactionType(row.reaction);

    if (!reaction) {
      continue;
    }

    const counts = countsByCommentId.get(row.flare_comment_id) ?? emptyReactionCounts();
    counts[reaction] += 1;
    countsByCommentId.set(row.flare_comment_id, counts);

    if (row.user_id === currentUserId) {
      userReactionByCommentId.set(row.flare_comment_id, reaction);
    }
  }

  return { countsByCommentId, userReactionByCommentId };
}

export type { FlareCommentReactionsContext } from "./get-flare-comment-reaction-bar-props";
