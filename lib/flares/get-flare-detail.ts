import { HELPFUL_TARGET } from "@/lib/helpful/target-types";
import {
  getFlareCommentReactionsForComments,
} from "@/lib/reactions/get-flare-comment-reactions";
import type { FlareCommentReactionsContext } from "@/lib/reactions/get-flare-comment-reaction-bar-props";
import {
  FLARE_COMMENT_SELECT,
  FLARE_SELECT,
  type FlareComment,
  type FlareRow,
} from "@/lib/flares/types";
import { createClient } from "@/utils/supabase/server";

export type FlareDetail = {
  flare: FlareRow;
  comments: FlareComment[];
  markedCommentIds: Set<string>;
  reactionsContext: FlareCommentReactionsContext;
  helperUserIds: Set<string>;
  isAuthor: boolean;
  isHelper: boolean;
};

export async function getFlareDetail(
  flareId: string,
  currentUserId: string
): Promise<FlareDetail | null> {
  const supabase = await createClient();

  const { data: flare, error: flareError } = await supabase
    .from("flares")
    .select(FLARE_SELECT)
    .eq("id", flareId)
    .maybeSingle();

  if (flareError) {
    throw new Error(flareError.message);
  }

  if (!flare) {
    return null;
  }

  const { data: comments, error: commentsError } = await supabase
    .from("flare_comments")
    .select(FLARE_COMMENT_SELECT)
    .eq("flare_id", flareId)
    .order("created_at", { ascending: true });

  if (commentsError) {
    throw new Error(commentsError.message);
  }

  const commentList = (comments ?? []) as FlareComment[];
  const commentIds = commentList.map((comment) => comment.id);
  const markedCommentIds = new Set<string>();

  const [reactionsContext, marksResult] = await Promise.all([
    getFlareCommentReactionsForComments(commentIds, currentUserId),
    commentIds.length > 0
      ? supabase
          .from("helpful_marks")
          .select("target_id")
          .eq("target_type", HELPFUL_TARGET.flare_comment)
          .eq("marker_id", currentUserId)
          .in("target_id", commentIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (marksResult.error && marksResult.error.code !== "22P02") {
    throw new Error(marksResult.error.message);
  }

  for (const mark of marksResult.data ?? []) {
    markedCommentIds.add(mark.target_id);
  }

  const helperUserIds = new Set(
    (flare.flare_helpers ?? []).map((helper) => helper.user_id)
  );

  return {
    flare: flare as FlareRow,
    comments: commentList,
    markedCommentIds,
    reactionsContext,
    helperUserIds,
    isAuthor: flare.author_id === currentUserId,
    isHelper: helperUserIds.has(currentUserId),
  };
}
