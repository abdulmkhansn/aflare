"use server";

import { revalidatePath } from "next/cache";

import { inlineError, inlineOk, type InlineActionResult } from "@/lib/actions/inline-result";
import { HELPFUL_TARGET } from "@/lib/helpful/target-types";
import { recordHelpGivenMilestone } from "@/lib/milestones/record-help-given";
import { isRepostPost } from "@/lib/posts/repost";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function readTrimmed(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function toggleCommentHelpful(formData: FormData): Promise<InlineActionResult> {
  const auth = await requireOnboarded();
  const commentId = readTrimmed(formData, "comment_id");
  const isMarked = readTrimmed(formData, "is_marked") === "1";

  if (!commentId) {
    return inlineError("That comment was not found.");
  }

  const supabase = await createClient();

  const { data: comment, error: commentError } = await supabase
    .from("comments")
    .select("id, author_id, post_id, posts ( project_id )")
    .eq("id", commentId)
    .maybeSingle();

  if (commentError || !comment) {
    return inlineError("That comment was not found.");
  }

  if (comment.author_id === auth.userId) {
    return inlineError("You cannot mark your own comment as helpful.");
  }

  const post = Array.isArray(comment.posts) ? comment.posts[0] : comment.posts;
  const projectId = post?.project_id;

  if (isMarked) {
    const { error: deleteError } = await supabase
      .from("helpful_marks")
      .delete()
      .eq("target_type", HELPFUL_TARGET.comment)
      .eq("target_id", commentId)
      .eq("marker_id", auth.userId);

    if (deleteError) {
      return inlineError(deleteError.message);
    }
  } else {
    const { error: insertError } = await supabase.from("helpful_marks").insert({
      target_type: HELPFUL_TARGET.comment,
      target_id: commentId,
      marker_id: auth.userId,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return inlineError("You already marked this comment as helpful.");
      }

      return inlineError(insertError.message);
    }

    await recordHelpGivenMilestone(supabase, comment.author_id);
  }

  revalidatePath("/");
  revalidatePath("/blockers");
  revalidatePath("/flarespace");
  revalidatePath(`/u/${comment.author_id}`);

  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }

  return inlineOk();
}

export async function toggleArticleHelpful(formData: FormData): Promise<InlineActionResult> {
  const auth = await requireOnboarded();
  const articleId = readTrimmed(formData, "article_id");
  const isMarked = readTrimmed(formData, "is_marked") === "1";

  if (!articleId) {
    return inlineError("That article was not found.");
  }

  const supabase = await createClient();

  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select("id, author_id")
    .eq("id", articleId)
    .maybeSingle();

  if (articleError || !article) {
    return inlineError("That article was not found.");
  }

  if (article.author_id === auth.userId) {
    return inlineError("You cannot mark your own article as helpful.");
  }

  if (isMarked) {
    const { error: deleteError } = await supabase
      .from("helpful_marks")
      .delete()
      .eq("target_type", HELPFUL_TARGET.article)
      .eq("target_id", articleId)
      .eq("marker_id", auth.userId);

    if (deleteError) {
      return inlineError(deleteError.message);
    }
  } else {
    const { error: insertError } = await supabase.from("helpful_marks").insert({
      target_type: HELPFUL_TARGET.article,
      target_id: articleId,
      marker_id: auth.userId,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return inlineError("You already marked this article as helpful.");
      }

      return inlineError(insertError.message);
    }

    await recordHelpGivenMilestone(supabase, article.author_id);
  }

  revalidatePath("/");
  revalidatePath(`/articles/${articleId}`);
  revalidatePath(`/u/${article.author_id}`);

  return inlineOk();
}

export async function togglePostHelpful(formData: FormData): Promise<InlineActionResult> {
  const auth = await requireOnboarded();
  const postId = readTrimmed(formData, "post_id");
  const isMarked = readTrimmed(formData, "is_marked") === "1";

  if (!postId) {
    return inlineError("That post was not found.");
  }

  const supabase = await createClient();

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, author_id, project_id, reposted_post_id, structured_fields")
    .eq("id", postId)
    .maybeSingle();

  if (postError || !post) {
    return inlineError("That post was not found.");
  }

  if (post.author_id === auth.userId) {
    return inlineError("You cannot mark your own post as helpful.");
  }

  if (isRepostPost(post)) {
    return inlineError("Reposts are amplification. Mark the original if it helped.");
  }

  if (isMarked) {
    const { error: deleteError } = await supabase
      .from("helpful_marks")
      .delete()
      .eq("target_type", HELPFUL_TARGET.post)
      .eq("target_id", postId)
      .eq("marker_id", auth.userId);

    if (deleteError) {
      return inlineError(deleteError.message);
    }
  } else {
    const { error: insertError } = await supabase.from("helpful_marks").insert({
      target_type: HELPFUL_TARGET.post,
      target_id: postId,
      marker_id: auth.userId,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return inlineError("You already marked this post as helpful.");
      }

      return inlineError(insertError.message);
    }

    await recordHelpGivenMilestone(supabase, post.author_id);
  }

  revalidatePath("/");
  revalidatePath("/blockers");
  revalidatePath("/flarespace");
  revalidatePath(`/u/${post.author_id}`);

  if (post.project_id) {
    revalidatePath(`/projects/${post.project_id}`);
  }

  return inlineOk();
}

export async function toggleFlareCommentHelpful(formData: FormData): Promise<InlineActionResult> {
  const auth = await requireOnboarded();
  const commentId = readTrimmed(formData, "comment_id");
  const flareId = readTrimmed(formData, "flare_id");
  const isMarked = readTrimmed(formData, "is_marked") === "1";

  if (!commentId || !flareId) {
    return inlineError("That reply was not found.");
  }

  const supabase = await createClient();

  const { data: flare, error: flareError } = await supabase
    .from("flares")
    .select("id, author_id")
    .eq("id", flareId)
    .maybeSingle();

  if (flareError || !flare) {
    return inlineError("That flare was not found.");
  }

  if (flare.author_id !== auth.userId) {
    return inlineError("Only the person who sent up this flare can mark a reply as helpful.");
  }

  const { data: comment, error: commentError } = await supabase
    .from("flare_comments")
    .select("id, author_id")
    .eq("id", commentId)
    .eq("flare_id", flareId)
    .maybeSingle();

  if (commentError || !comment) {
    return inlineError("That reply was not found.");
  }

  if (comment.author_id === auth.userId) {
    return inlineError("You cannot mark your own reply as helpful.");
  }

  if (isMarked) {
    const { error: deleteError } = await supabase
      .from("helpful_marks")
      .delete()
      .eq("target_type", HELPFUL_TARGET.flare_comment)
      .eq("target_id", commentId)
      .eq("marker_id", auth.userId);

    if (deleteError) {
      return inlineError(deleteError.message);
    }
  } else {
    const { error: insertError } = await supabase.from("helpful_marks").insert({
      target_type: HELPFUL_TARGET.flare_comment,
      target_id: commentId,
      marker_id: auth.userId,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return inlineError("You already marked this reply as helpful.");
      }

      return inlineError(insertError.message);
    }

    await recordHelpGivenMilestone(supabase, comment.author_id);
  }

  revalidatePath("/");
  revalidatePath("/flarespace");
  revalidatePath(`/flarespace/${flareId}`);
  revalidatePath(`/u/${comment.author_id}`);

  return inlineOk();
}
