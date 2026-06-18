"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createMentionNotifications } from "@/lib/mentions/create-mention-notifications";
import { resolvePostKind } from "@/lib/posts/kinds";
import { buildRepostStructuredFields } from "@/lib/posts/repost";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function readTrimmed(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function repostErrorRedirect(redirectTo: string, message: string): never {
  const separator = redirectTo.includes("?") ? "&" : "?";
  redirect(`${redirectTo}${separator}repostError=${encodeURIComponent(message)}`);
}

export async function repostPost(formData: FormData) {
  const auth = await requireOnboarded();
  const postId = readTrimmed(formData, "post_id");
  const quote = readTrimmed(formData, "quote");
  const redirectTo = readTrimmed(formData, "redirect_to") || "/";

  if (!postId) {
    repostErrorRedirect(redirectTo, "That post was not found.");
  }

  const supabase = await createClient();

  const { data: original, error: originalError } = await supabase
    .from("posts")
    .select("id, author_id, kind, article_id, project_id")
    .eq("id", postId)
    .maybeSingle();

  if (originalError || !original) {
    repostErrorRedirect(redirectTo, "That post was not found.");
  }

  if (original.author_id === auth.userId) {
    repostErrorRedirect(redirectTo, "You can't repost your own post.");
  }

  if (resolvePostKind(original) === "article") {
    repostErrorRedirect(redirectTo, "Articles can't be reposted yet.");
  }

  const { data: repost, error: insertError } = await supabase
    .from("posts")
    .insert({
      author_id: auth.userId,
      kind: "share",
      type: "update",
      body: quote,
      project_id: null,
      article_id: null,
      reposted_post_id: postId,
      structured_fields: buildRepostStructuredFields(),
    })
    .select("id")
    .single();

  if (insertError || !repost) {
    repostErrorRedirect(redirectTo, insertError?.message ?? "Could not repost that.");
  }

  if (quote) {
    await createMentionNotifications(quote, {
      actorId: auth.userId,
      postId: repost.id,
    });
  }

  revalidatePath("/");
  revalidatePath("/flarespace");
  revalidatePath("/blockers");

  if (original.project_id) {
    revalidatePath(`/projects/${original.project_id}`);
  }

  const separator = redirectTo.includes("?") ? "&" : "?";
  redirect(`${redirectTo}${separator}reposted=1`);
}
