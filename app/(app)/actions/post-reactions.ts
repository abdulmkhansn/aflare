"use server";

import { revalidatePath } from "next/cache";

import { normalizeReactionType, type PostReactionType } from "@/lib/reactions/types";
import { POST_REACTION_TYPES } from "@/lib/reactions/types";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function isPostReactionType(value: string): value is PostReactionType {
  return POST_REACTION_TYPES.includes(value as PostReactionType);
}

async function revalidatePostPaths(supabase: Awaited<ReturnType<typeof createClient>>, postId: string) {
  revalidatePath("/");
  revalidatePath("/blockers");

  const { data: post } = await supabase
    .from("posts")
    .select("project_id")
    .eq("id", postId)
    .maybeSingle();

  if (post?.project_id) {
    revalidatePath(`/projects/${post.project_id}`);
  }
}

export async function setPostSocialReaction(postId: string, reaction: string) {
  const auth = await requireOnboarded();

  if (!postId || !isPostReactionType(reaction)) {
    return { error: "That reaction was not found." };
  }

  const supabase = await createClient();

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id")
    .eq("id", postId)
    .maybeSingle();

  if (postError || !post) {
    return { error: "That post was not found." };
  }

  const { data: existing, error: existingError } = await supabase
    .from("post_reactions")
    .select("reaction")
    .eq("post_id", postId)
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
      .from("post_reactions")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", auth.userId);

    if (deleteError) {
      return { error: deleteError.message };
    }
  } else {
    const { error: upsertError } = await supabase.from("post_reactions").upsert(
      {
        post_id: postId,
        user_id: auth.userId,
        reaction,
      },
      { onConflict: "post_id,user_id" }
    );

    if (upsertError) {
      return { error: upsertError.message };
    }
  }

  await revalidatePostPaths(supabase, postId);

  return { ok: true };
}
