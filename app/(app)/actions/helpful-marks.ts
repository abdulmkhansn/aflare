"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function readTrimmed(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function helpfulErrorRedirect(redirectTo: string, message: string): never {
  const separator = redirectTo.includes("?") ? "&" : "?";
  redirect(`${redirectTo}${separator}helpfulError=${encodeURIComponent(message)}`);
}

export async function toggleCommentHelpful(formData: FormData) {
  const auth = await requireOnboarded();
  const commentId = readTrimmed(formData, "comment_id");
  const isMarked = readTrimmed(formData, "is_marked") === "1";
  const redirectTo = readTrimmed(formData, "redirect_to") || "/";

  if (!commentId) {
    helpfulErrorRedirect(redirectTo, "That comment was not found.");
  }

  const supabase = await createClient();

  const { data: comment, error: commentError } = await supabase
    .from("comments")
    .select("id, author_id, post_id, posts ( project_id )")
    .eq("id", commentId)
    .maybeSingle();

  if (commentError || !comment) {
    helpfulErrorRedirect(redirectTo, "That comment was not found.");
  }

  if (comment.author_id === auth.userId) {
    helpfulErrorRedirect(redirectTo, "You cannot mark your own comment as helpful.");
  }

  const post = Array.isArray(comment.posts) ? comment.posts[0] : comment.posts;
  const projectId = post?.project_id;

  if (isMarked) {
    const { error: deleteError } = await supabase
      .from("helpful_marks")
      .delete()
      .eq("target_type", "comment")
      .eq("target_id", commentId)
      .eq("marker_id", auth.userId);

    if (deleteError) {
      helpfulErrorRedirect(redirectTo, deleteError.message);
    }
  } else {
    const { error: insertError } = await supabase.from("helpful_marks").insert({
      target_type: "comment",
      target_id: commentId,
      marker_id: auth.userId,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        helpfulErrorRedirect(redirectTo, "You already marked this comment as helpful.");
      }
      helpfulErrorRedirect(redirectTo, insertError.message);
    }
  }

  revalidatePath("/");
  revalidatePath("/blockers");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }

  redirect(redirectTo);
}

export async function toggleArticleHelpful(formData: FormData) {
  const auth = await requireOnboarded();
  const articleId = readTrimmed(formData, "article_id");
  const isMarked = readTrimmed(formData, "is_marked") === "1";
  const redirectTo = readTrimmed(formData, "redirect_to") || "/";

  if (!articleId) {
    helpfulErrorRedirect(redirectTo, "That article was not found.");
  }

  const supabase = await createClient();

  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select("id, author_id")
    .eq("id", articleId)
    .maybeSingle();

  if (articleError || !article) {
    helpfulErrorRedirect(redirectTo, "That article was not found.");
  }

  if (article.author_id === auth.userId) {
    helpfulErrorRedirect(redirectTo, "You cannot mark your own article as helpful.");
  }

  if (isMarked) {
    const { error: deleteError } = await supabase
      .from("helpful_marks")
      .delete()
      .eq("target_type", "article")
      .eq("target_id", articleId)
      .eq("marker_id", auth.userId);

    if (deleteError) {
      helpfulErrorRedirect(redirectTo, deleteError.message);
    }
  } else {
    const { error: insertError } = await supabase.from("helpful_marks").insert({
      target_type: "article",
      target_id: articleId,
      marker_id: auth.userId,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        helpfulErrorRedirect(redirectTo, "You already marked this article as helpful.");
      }
      helpfulErrorRedirect(redirectTo, insertError.message);
    }
  }

  revalidatePath("/");
  revalidatePath(`/articles/${articleId}`);

  redirect(redirectTo);
}
