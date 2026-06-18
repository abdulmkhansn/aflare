"use server";

import { revalidatePath } from "next/cache";

import { normalizeReactionType, type PostReactionType } from "@/lib/reactions/types";
import { POST_REACTION_TYPES } from "@/lib/reactions/types";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function isPostReactionType(value: string): value is PostReactionType {
  return POST_REACTION_TYPES.includes(value as PostReactionType);
}

export async function setFlareCommentSocialReaction(commentId: string, reaction: string) {
  const auth = await requireOnboarded();

  if (!commentId || !isPostReactionType(reaction)) {
    return { error: "That reaction was not found." };
  }

  const supabase = await createClient();

  const { data: comment, error: commentError } = await supabase
    .from("flare_comments")
    .select("id, flare_id")
    .eq("id", commentId)
    .maybeSingle();

  if (commentError || !comment) {
    return { error: "That reply was not found." };
  }

  const { data: existing, error: existingError } = await supabase
    .from("flare_comment_reactions")
    .select("reaction")
    .eq("flare_comment_id", commentId)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (existingError) {
    return { error: existingError.message };
  }

  const existingReaction = existing?.reaction
    ? normalizeReactionType(String(existing.reaction))
    : null;

  if (existingReaction === reaction) {
    const { error: deleteError } = await supabase
      .from("flare_comment_reactions")
      .delete()
      .eq("flare_comment_id", commentId)
      .eq("user_id", auth.userId);

    if (deleteError) {
      return { error: deleteError.message };
    }
  } else {
    const { error: upsertError } = await supabase.from("flare_comment_reactions").upsert(
      {
        flare_comment_id: commentId,
        user_id: auth.userId,
        reaction,
      },
      { onConflict: "flare_comment_id,user_id" }
    );

    if (upsertError) {
      return { error: upsertError.message };
    }
  }

  revalidatePath("/");
  revalidatePath("/flarespace");
  revalidatePath(`/flarespace/${comment.flare_id}`);

  return { ok: true };
}
