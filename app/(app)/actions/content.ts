"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { inlineError, inlineOk, type InlineActionResult } from "@/lib/actions/inline-result";
import { isBoostPost } from "@/lib/posts/boost";
import { isRepostPost } from "@/lib/posts/repost";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function readTrimmed(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

async function ensurePostAuthor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("posts")
    .select("id, author_id, project_id, kind, reposted_post_id, boosted_flare_id, structured_fields")
    .eq("id", postId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  if (data.author_id !== userId) {
    return null;
  }

  return data;
}

export async function updatePost(formData: FormData) {
  const auth = await requireOnboarded();
  const postId = readTrimmed(formData, "post_id");
  const body = readTrimmed(formData, "body");
  const redirectTo = readTrimmed(formData, "redirect_to") || "/";

  if (!postId) {
    redirectWithError(redirectTo, "That post was not found.");
  }

  const supabase = await createClient();
  const post = await ensurePostAuthor(supabase, postId, auth.userId);

  if (!post) {
    redirectWithError(redirectTo, "You can only edit your own posts.");
  }

  if (post.kind === "article") {
    redirectWithError(redirectTo, "Edit articles from the article page.");
  }

  const isRepost = isRepostPost(post);
  const isBoost = isBoostPost(post);

  if (!isRepost && !isBoost && !body) {
    redirectWithError(redirectTo, "Write something before saving.");
  }

  const { error } = await supabase
    .from("posts")
    .update({ body, edited_at: new Date().toISOString() })
    .eq("id", postId);

  if (error) {
    redirectWithError(redirectTo, error.message);
  }

  revalidatePath("/");
  revalidatePath("/flarespace");
  if (post.project_id) {
    revalidatePath(`/projects/${post.project_id}`);
  }

  redirect(redirectTo);
}

export async function deletePost(formData: FormData) {
  const auth = await requireOnboarded();
  const postId = readTrimmed(formData, "post_id");
  const redirectTo = readTrimmed(formData, "redirect_to") || "/";

  if (!postId) {
    redirect(redirectTo);
  }

  const supabase = await createClient();
  const post = await ensurePostAuthor(supabase, postId, auth.userId);

  if (!post) {
    redirectWithError(redirectTo, "You can only delete your own posts.");
  }

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    redirectWithError(redirectTo, error.message);
  }

  revalidatePath("/");
  revalidatePath("/flarespace");
  if (post.project_id) {
    revalidatePath(`/projects/${post.project_id}`);
  }

  redirect(redirectTo);
}

async function ensureCommentAuthor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  commentId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("comments")
    .select("id, author_id, post_id, posts ( project_id )")
    .eq("id", commentId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  if (data.author_id !== userId) {
    return null;
  }

  return data;
}

export async function updateComment(formData: FormData): Promise<InlineActionResult> {
  const auth = await requireOnboarded();
  const commentId = readTrimmed(formData, "comment_id");
  const body = readTrimmed(formData, "body");

  if (!commentId || !body) {
    return inlineError("Write something before saving.");
  }

  const supabase = await createClient();
  const comment = await ensureCommentAuthor(supabase, commentId, auth.userId);

  if (!comment) {
    return inlineError("You can only edit your own comments.");
  }

  const { error } = await supabase
    .from("comments")
    .update({ body, edited_at: new Date().toISOString() })
    .eq("id", commentId);

  if (error) {
    return inlineError(error.message);
  }

  const post = Array.isArray(comment.posts) ? comment.posts[0] : comment.posts;

  revalidatePath("/");
  revalidatePath("/flarespace");

  if (post?.project_id) {
    revalidatePath(`/projects/${post.project_id}`);
  }

  return inlineOk();
}

export async function deleteComment(formData: FormData): Promise<InlineActionResult> {
  const auth = await requireOnboarded();
  const commentId = readTrimmed(formData, "comment_id");

  if (!commentId) {
    return inlineError("That comment was not found.");
  }

  const supabase = await createClient();
  const comment = await ensureCommentAuthor(supabase, commentId, auth.userId);

  if (!comment) {
    return inlineError("You can only delete your own comments.");
  }

  const { error } = await supabase.from("comments").delete().eq("id", commentId);

  if (error) {
    return inlineError(error.message);
  }

  const post = Array.isArray(comment.posts) ? comment.posts[0] : comment.posts;

  revalidatePath("/");
  revalidatePath("/flarespace");

  if (post?.project_id) {
    revalidatePath(`/projects/${post.project_id}`);
  }

  return inlineOk();
}

async function ensureFlareAuthor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  flareId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("flares")
    .select("id, author_id")
    .eq("id", flareId)
    .maybeSingle();

  if (error || !data || data.author_id !== userId) {
    return null;
  }

  return data;
}

export async function updateFlare(formData: FormData) {
  const auth = await requireOnboarded();
  const flareId = readTrimmed(formData, "flare_id");
  const body = readTrimmed(formData, "body");
  const title = readTrimmed(formData, "title") || null;
  const redirectTo = readTrimmed(formData, "redirect_to") || `/flarespace/${flareId}`;

  if (!flareId || !body) {
    redirectWithError(redirectTo, "Write something before saving.");
  }

  const supabase = await createClient();
  const flare = await ensureFlareAuthor(supabase, flareId, auth.userId);

  if (!flare) {
    redirectWithError(redirectTo, "You can only edit your own flares.");
  }

  const { error } = await supabase
    .from("flares")
    .update({
      body,
      title,
      edited_at: new Date().toISOString(),
    })
    .eq("id", flareId);

  if (error) {
    redirectWithError(redirectTo, error.message);
  }

  revalidatePath("/");
  revalidatePath("/flarespace");
  revalidatePath(`/flarespace/${flareId}`);

  redirect(redirectTo);
}

export async function deleteFlare(formData: FormData) {
  const auth = await requireOnboarded();
  const flareId = readTrimmed(formData, "flare_id");
  const redirectTo = readTrimmed(formData, "redirect_to") || "/flarespace";

  if (!flareId) {
    redirect(redirectTo);
  }

  const supabase = await createClient();
  const flare = await ensureFlareAuthor(supabase, flareId, auth.userId);

  if (!flare) {
    redirectWithError(redirectTo, "You can only delete your own flares.");
  }

  const { error } = await supabase.from("flares").delete().eq("id", flareId);

  if (error) {
    redirectWithError(redirectTo, error.message);
  }

  revalidatePath("/");
  revalidatePath("/flarespace");

  redirect(redirectTo);
}

async function ensureFlareCommentAuthor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  commentId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("flare_comments")
    .select("id, author_id, flare_id")
    .eq("id", commentId)
    .maybeSingle();

  if (error || !data || data.author_id !== userId) {
    return null;
  }

  return data;
}

export async function updateFlareComment(formData: FormData): Promise<InlineActionResult> {
  const auth = await requireOnboarded();
  const commentId = readTrimmed(formData, "comment_id");
  const body = readTrimmed(formData, "body");

  if (!commentId || !body) {
    return inlineError("Write something before saving.");
  }

  const supabase = await createClient();
  const comment = await ensureFlareCommentAuthor(supabase, commentId, auth.userId);

  if (!comment) {
    return inlineError("You can only edit your own replies.");
  }

  const { error } = await supabase
    .from("flare_comments")
    .update({ body, edited_at: new Date().toISOString() })
    .eq("id", commentId);

  if (error) {
    return inlineError(error.message);
  }

  revalidatePath("/");
  revalidatePath("/flarespace");
  revalidatePath(`/flarespace/${comment.flare_id}`);

  return inlineOk();
}

export async function deleteFlareComment(formData: FormData): Promise<InlineActionResult> {
  const auth = await requireOnboarded();
  const commentId = readTrimmed(formData, "comment_id");

  if (!commentId) {
    return inlineError("That reply was not found.");
  }

  const supabase = await createClient();
  const comment = await ensureFlareCommentAuthor(supabase, commentId, auth.userId);

  if (!comment) {
    return inlineError("You can only delete your own replies.");
  }

  const { error } = await supabase.from("flare_comments").delete().eq("id", commentId);

  if (error) {
    return inlineError(error.message);
  }

  revalidatePath("/");
  revalidatePath("/flarespace");
  revalidatePath(`/flarespace/${comment.flare_id}`);

  return inlineOk();
}
