import type { BookmarksContext } from "@/lib/bookmarks/types";
import { emptyBookmarksContext } from "@/lib/bookmarks/types";
import { createClient } from "@/utils/supabase/server";

type BookmarkQueryInput = {
  postIds?: string[];
  flareIds?: string[];
  articleIds?: string[];
};

export async function getBookmarksContext(
  userId: string,
  input: BookmarkQueryInput = {}
): Promise<BookmarksContext> {
  const postIds = [...new Set(input.postIds ?? [])].filter(Boolean);
  const flareIds = [...new Set(input.flareIds ?? [])].filter(Boolean);
  const articleIds = [...new Set(input.articleIds ?? [])].filter(Boolean);

  if (postIds.length === 0 && flareIds.length === 0 && articleIds.length === 0) {
    return emptyBookmarksContext();
  }

  const supabase = await createClient();
  const context = emptyBookmarksContext();

  if (postIds.length > 0) {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", userId)
      .in("post_id", postIds);

    if (error) {
      throw new Error(error.message);
    }

    for (const row of data ?? []) {
      if (row.post_id) {
        context.postIds.add(row.post_id);
      }
    }
  }

  if (flareIds.length > 0) {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("flare_id")
      .eq("user_id", userId)
      .in("flare_id", flareIds);

    if (error) {
      throw new Error(error.message);
    }

    for (const row of data ?? []) {
      if (row.flare_id) {
        context.flareIds.add(row.flare_id);
      }
    }
  }

  if (articleIds.length > 0) {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("article_id")
      .eq("user_id", userId)
      .in("article_id", articleIds);

    if (error) {
      throw new Error(error.message);
    }

    for (const row of data ?? []) {
      if (row.article_id) {
        context.articleIds.add(row.article_id);
      }
    }
  }

  return context;
}

export async function isTargetBookmarked(
  userId: string,
  targetType: "post" | "flare" | "article",
  targetId: string
): Promise<boolean> {
  const column =
    targetType === "post" ? "post_id" : targetType === "flare" ? "flare_id" : "article_id";

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .select("user_id")
    .eq("user_id", userId)
    .eq(column, targetId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}
