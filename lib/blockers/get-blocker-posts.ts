import { POST_BATCH_SIZE } from "@/lib/app/constants";
import { BLOCKER_POST_TYPES } from "@/lib/posts/post-types";
import { createClient } from "@/utils/supabase/server";

import { FEED_POST_SELECT, type FeedPost } from "@/lib/feed/types";

const BLOCKERS_COLLECT_LIMIT = 200;

export type BlockerPostsResult = {
  posts: FeedPost[];
  activeTagId: string | null;
  hasMore: boolean;
};

export type BlockerPagination = {
  limit?: number;
  offset?: number;
};

export async function getBlockerPosts(
  tagId?: string | null,
  pagination?: BlockerPagination
): Promise<BlockerPostsResult> {
  const limit = pagination?.limit ?? POST_BATCH_SIZE;
  const offset = pagination?.offset ?? 0;
  const supabase = await createClient();
  const activeTagId = tagId?.trim() || null;

  if (activeTagId) {
    const { data: projectTags, error: projectTagsError } = await supabase
      .from("project_tags")
      .select("project_id")
      .eq("tag_id", activeTagId);

    if (projectTagsError) {
      throw new Error(projectTagsError.message);
    }

    const projectIds = [...new Set(projectTags?.map((row) => row.project_id) ?? [])];

    if (projectIds.length === 0) {
      return { posts: [], activeTagId, hasMore: false };
    }

    const { data, error } = await supabase
      .from("posts")
      .select(FEED_POST_SELECT)
      .in("type", [...BLOCKER_POST_TYPES])
      .in("project_id", projectIds)
      .order("created_at", { ascending: false })
      .limit(BLOCKERS_COLLECT_LIMIT);

    if (error) {
      throw new Error(error.message);
    }

    const all = (data ?? []) as FeedPost[];
    const page = all.slice(offset, offset + limit);

    return {
      posts: page,
      activeTagId,
      hasMore: all.length > offset + limit,
    };
  }

  const { data, error } = await supabase
    .from("posts")
    .select(FEED_POST_SELECT)
    .in("type", [...BLOCKER_POST_TYPES])
    .order("created_at", { ascending: false })
    .limit(BLOCKERS_COLLECT_LIMIT);

  if (error) {
    throw new Error(error.message);
  }

  const all = (data ?? []) as FeedPost[];
  const page = all.slice(offset, offset + limit);

  return {
    posts: page,
    activeTagId: null,
    hasMore: all.length > offset + limit,
  };
}
