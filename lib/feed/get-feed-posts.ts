import { createClient } from "@/utils/supabase/server";

import { POST_BATCH_SIZE } from "@/lib/app/constants";
import type { FeedFilter } from "@/lib/feed/feed-filters";
import { BLOCKER_POST_TYPES } from "@/lib/posts/post-types";

import {
  FEED_POST_SELECT,
  dedupeAndSortPosts,
  type FeedPost,
} from "./types";

const FEED_COLLECT_LIMIT = 200;

export type FeedResult = {
  posts: FeedPost[];
  usedFallback: boolean;
  hasMore: boolean;
  filter: FeedFilter;
};

export type FeedPagination = {
  limit?: number;
  offset?: number;
  filter?: FeedFilter;
};

function applyFeedFilter(
  posts: FeedPost[],
  filter: FeedFilter,
  followingIds: string[]
): FeedPost[] {
  switch (filter) {
    case "blockers":
      return posts.filter((post) =>
        BLOCKER_POST_TYPES.includes(post.type as (typeof BLOCKER_POST_TYPES)[number])
      );
    case "shipped":
      return posts.filter((post) => post.type === "shipped");
    case "following":
      return posts.filter((post) => followingIds.includes(post.author_id));
  }

  return posts;
}

export async function getFeedPosts(
  userId: string,
  pagination?: FeedPagination
): Promise<FeedResult> {
  const limit = pagination?.limit ?? POST_BATCH_SIZE;
  const offset = pagination?.offset ?? 0;
  const filter = pagination?.filter ?? "all";
  const supabase = await createClient();
  const collected: FeedPost[] = [];

  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  const followingIds = follows?.map((row) => row.following_id) ?? [];

  const { data: profileTags } = await supabase
    .from("profile_tags")
    .select("tag_id")
    .eq("profile_id", userId);

  const userTagIds = profileTags?.map((row) => row.tag_id) ?? [];

  let tagMatchedProjectIds: string[] = [];

  if (userTagIds.length > 0) {
    const { data: projectTags } = await supabase
      .from("project_tags")
      .select("project_id")
      .in("tag_id", userTagIds);

    tagMatchedProjectIds = [
      ...new Set(projectTags?.map((row) => row.project_id) ?? []),
    ];
  }

  if (filter === "following") {
    if (followingIds.length > 0) {
      const { data } = await supabase
        .from("posts")
        .select(FEED_POST_SELECT)
        .in("author_id", followingIds)
        .order("created_at", { ascending: false })
        .limit(FEED_COLLECT_LIMIT);

      if (data) {
        collected.push(...(data as FeedPost[]));
      }
    }
  } else {
    if (followingIds.length > 0) {
      const { data } = await supabase
        .from("posts")
        .select(FEED_POST_SELECT)
        .in("author_id", followingIds)
        .order("created_at", { ascending: false })
        .limit(FEED_COLLECT_LIMIT);

      if (data) {
        collected.push(...(data as FeedPost[]));
      }
    }

    const { data: ownPosts } = await supabase
      .from("posts")
      .select(FEED_POST_SELECT)
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(FEED_COLLECT_LIMIT);

    if (ownPosts) {
      collected.push(...(ownPosts as FeedPost[]));
    }

    if (tagMatchedProjectIds.length > 0) {
      const { data } = await supabase
        .from("posts")
        .select(FEED_POST_SELECT)
        .in("project_id", tagMatchedProjectIds)
        .order("created_at", { ascending: false })
        .limit(FEED_COLLECT_LIMIT);

      if (data) {
        collected.push(...(data as FeedPost[]));
      }
    }
  }

  let personalized = dedupeAndSortPosts(collected).slice(0, FEED_COLLECT_LIMIT);
  personalized = applyFeedFilter(personalized, filter, followingIds);

  if (personalized.length > 0 || filter !== "all") {
    const page = personalized.slice(offset, offset + limit);

    return {
      posts: page,
      usedFallback: false,
      hasMore: personalized.length > offset + limit,
      filter,
    };
  }

  const { data: fallbackPosts, error } = await supabase
    .from("posts")
    .select(FEED_POST_SELECT)
    .order("created_at", { ascending: false })
    .limit(FEED_COLLECT_LIMIT);

  if (error) {
    throw new Error(error.message);
  }

  const all = applyFeedFilter((fallbackPosts ?? []) as FeedPost[], filter, followingIds);
  const page = all.slice(offset, offset + limit);

  return {
    posts: page,
    usedFallback: true,
    hasMore: all.length > offset + limit,
    filter,
  };
}
