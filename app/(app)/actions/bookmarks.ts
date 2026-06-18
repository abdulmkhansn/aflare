"use server";

import { revalidatePath } from "next/cache";

import {
  BOOKMARK_TARGET_TYPES,
  type BookmarkTargetType,
} from "@/lib/bookmarks/types";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function isBookmarkTargetType(value: string): value is BookmarkTargetType {
  return BOOKMARK_TARGET_TYPES.includes(value as BookmarkTargetType);
}

function targetColumn(targetType: BookmarkTargetType) {
  if (targetType === "post") {
    return "post_id";
  }

  if (targetType === "flare") {
    return "flare_id";
  }

  return "article_id";
}

async function revalidateBookmarkPaths(
  supabase: Awaited<ReturnType<typeof createClient>>,
  targetType: BookmarkTargetType,
  targetId: string
) {
  revalidatePath("/");
  revalidatePath("/saved");
  revalidatePath("/flarespace");

  if (targetType === "post") {
    const { data: post } = await supabase
      .from("posts")
      .select("project_id")
      .eq("id", targetId)
      .maybeSingle();

    if (post?.project_id) {
      revalidatePath(`/projects/${post.project_id}`);
    }

    return;
  }

  if (targetType === "flare") {
    revalidatePath(`/flarespace/${targetId}`);
    return;
  }

  revalidatePath(`/articles/${targetId}`);
}

export async function toggleBookmark(
  targetType: string,
  targetId: string,
  currentlySaved: boolean
): Promise<{ ok?: boolean; error?: string }> {
  const auth = await requireOnboarded();

  if (!targetId || !isBookmarkTargetType(targetType)) {
    return { error: "That item was not found." };
  }

  const supabase = await createClient();
  const column = targetColumn(targetType);

  if (currentlySaved) {
    const { error: deleteError } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", auth.userId)
      .eq(column, targetId);

    if (deleteError) {
      return { error: deleteError.message };
    }
  } else {
    const row = {
      user_id: auth.userId,
      post_id: targetType === "post" ? targetId : null,
      flare_id: targetType === "flare" ? targetId : null,
      article_id: targetType === "article" ? targetId : null,
    };

    const { error: insertError } = await supabase.from("bookmarks").insert(row);

    if (insertError) {
      if (insertError.code === "23505") {
        return { ok: true };
      }

      return { error: insertError.message };
    }
  }

  await revalidateBookmarkPaths(supabase, targetType, targetId);

  return { ok: true };
}
