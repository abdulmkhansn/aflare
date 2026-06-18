"use server";

import { revalidatePath } from "next/cache";

import { inlineError, inlineOk, type InlineActionResult } from "@/lib/actions/inline-result";
import { createMentionNotifications } from "@/lib/mentions/create-mention-notifications";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function readTrimmed(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createComment(formData: FormData): Promise<InlineActionResult> {
  const auth = await requireOnboarded();
  const postId = readTrimmed(formData, "post_id");
  const body = readTrimmed(formData, "body");

  if (!postId) {
    return inlineError("Pick a post to reply to.");
  }

  if (!body) {
    return inlineError("Write a comment before posting.");
  }

  const supabase = await createClient();

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, project_id")
    .eq("id", postId)
    .maybeSingle();

  if (postError || !post) {
    return inlineError("That post was not found.");
  }

  const { data: comment, error: insertError } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      author_id: auth.userId,
      body,
    })
    .select("id")
    .single();

  if (insertError || !comment) {
    return inlineError(insertError?.message ?? "Couldn't post that comment.");
  }

  await createMentionNotifications(body, {
    actorId: auth.userId,
    postId,
    commentId: comment.id,
  });

  revalidatePath("/");
  revalidatePath("/blockers");
  revalidatePath("/flarespace");

  if (post.project_id) {
    revalidatePath(`/projects/${post.project_id}`);
  }

  return inlineOk();
}
