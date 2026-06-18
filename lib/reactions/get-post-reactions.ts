import { HELPFUL_TARGET } from "@/lib/helpful/target-types";
import { createClient } from "@/utils/supabase/server";

import {
  emptyReactionCounts,
  normalizeReactionType,
  type PostReactionType,
  type PostReactionsContext,
} from "./types";

export async function getPostReactionsForPosts(
  postIds: string[],
  currentUserId: string
): Promise<PostReactionsContext> {
  const countsByPostId = new Map<string, ReturnType<typeof emptyReactionCounts>>();
  const userReactionByPostId = new Map<string, PostReactionType | null>();
  const markedHelpfulPostIds = new Set<string>();
  const helpfulCountsByPostId = new Map<string, number>();

  for (const postId of postIds) {
    countsByPostId.set(postId, emptyReactionCounts());
    userReactionByPostId.set(postId, null);
    helpfulCountsByPostId.set(postId, 0);
  }

  if (postIds.length === 0) {
    return { countsByPostId, userReactionByPostId, markedHelpfulPostIds, helpfulCountsByPostId };
  }

  const supabase = await createClient();

  const [{ data: reactions, error: reactionsError }, { data: helpfulMarks, error: helpfulError }] =
    await Promise.all([
      supabase.from("post_reactions").select("post_id, user_id, reaction").in("post_id", postIds),
      supabase
        .from("helpful_marks")
        .select("target_id, marker_id")
        .eq("target_type", HELPFUL_TARGET.post)
        .in("target_id", postIds),
    ]);

  if (reactionsError) {
    throw new Error(reactionsError.message);
  }

  if (helpfulError) {
    throw new Error(helpfulError.message);
  }

  for (const row of reactions ?? []) {
    const reaction = normalizeReactionType(row.reaction);

    if (!reaction) {
      continue;
    }

    const counts = countsByPostId.get(row.post_id) ?? emptyReactionCounts();
    counts[reaction] += 1;
    countsByPostId.set(row.post_id, counts);

    if (row.user_id === currentUserId) {
      userReactionByPostId.set(row.post_id, reaction);
    }
  }

  for (const mark of helpfulMarks ?? []) {
    helpfulCountsByPostId.set(
      mark.target_id,
      (helpfulCountsByPostId.get(mark.target_id) ?? 0) + 1
    );

    if (mark.marker_id === currentUserId) {
      markedHelpfulPostIds.add(mark.target_id);
    }
  }

  return { countsByPostId, userReactionByPostId, markedHelpfulPostIds, helpfulCountsByPostId };
}
