"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createMentionNotifications } from "@/lib/mentions/create-mention-notifications";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function readTrimmed(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function commentErrorRedirect(redirectTo: string, postId: string, message: string): never {
  const separator = redirectTo.includes("?") ? "&" : "?";
  redirect(
    `${redirectTo}${separator}commentError=${encodeURIComponent(`${postId}:${message}`)}`
  );
}

export async function createComment(formData: FormData) {
  const auth = await requireOnboarded();
  const postId = readTrimmed(formData, "post_id");
  const body = readTrimmed(formData, "body");
  const redirectTo = readTrimmed(formData, "redirect_to") || "/";

  if (!postId) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Pick a post to reply to.")}`);
  }

  if (!body) {
    commentErrorRedirect(redirectTo, postId, "Write a comment before posting.");
  }

  const supabase = await createClient();

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, project_id")
    .eq("id", postId)
    .maybeSingle();

  if (postError || !post) {
    commentErrorRedirect(redirectTo, postId, "That post was not found.");
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
    commentErrorRedirect(redirectTo, postId, insertError?.message ?? "Could not post that comment.");
  }

  await createMentionNotifications(body, {
    actorId: auth.userId,
    postId,
    commentId: comment.id,
  });

  revalidatePath("/");
  revalidatePath("/blockers");
  revalidatePath("/flarespace");
  revalidatePath(`/projects/${post.project_id}`);

  const separator = redirectTo.includes("?") ? "&" : "?";
  redirect(`${redirectTo}${separator}commentPosted=${postId}`);
}
