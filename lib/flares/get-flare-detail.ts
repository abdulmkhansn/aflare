import { HELPFUL_TARGET } from "@/lib/helpful/target-types";
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

  if (commentIds.length > 0) {
    const { data: marks, error: marksError } = await supabase
      .from("helpful_marks")
      .select("target_id")
      .eq("target_type", HELPFUL_TARGET.flare_comment)
      .eq("marker_id", currentUserId)
      .in("target_id", commentIds);

    if (marksError && marksError.code !== "22P02") {
      throw new Error(marksError.message);
    }

    for (const mark of marks ?? []) {
      markedCommentIds.add(mark.target_id);
    }
  }

  const helperUserIds = new Set(
    (flare.flare_helpers ?? []).map((helper) => helper.user_id)
  );

  return {
    flare: flare as FlareRow,
    comments: commentList,
    markedCommentIds,
    helperUserIds,
    isAuthor: flare.author_id === currentUserId,
    isHelper: helperUserIds.has(currentUserId),
  };
}
