"use server";

import { revalidatePath } from "next/cache";

import { inlineError, inlineOk, type InlineActionResult } from "@/lib/actions/inline-result";
import { createMentionNotifications } from "@/lib/mentions/create-mention-notifications";
import { resolvePostKind } from "@/lib/posts/kinds";
import { buildRepostStructuredFields } from "@/lib/posts/repost";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function readTrimmed(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function repostPost(formData: FormData): Promise<InlineActionResult> {
  const auth = await requireOnboarded();
  const postId = readTrimmed(formData, "post_id");
  const quote = readTrimmed(formData, "quote");

  if (!postId) {
    return inlineError("That post was not found.");
  }

  const supabase = await createClient();

  const { data: original, error: originalError } = await supabase
    .from("posts")
    .select("id, author_id, kind, article_id, project_id")
    .eq("id", postId)
    .maybeSingle();

  if (originalError || !original) {
    return inlineError("That post was not found.");
  }

  if (original.author_id === auth.userId) {
    return inlineError("You can't repost your own post.");
  }

  if (resolvePostKind(original) === "article") {
    return inlineError("Articles can't be reposted yet.");
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
    return inlineError(insertError?.message ?? "Couldn't repost that.");
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

  return inlineOk();
}
