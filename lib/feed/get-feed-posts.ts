import { createClient } from "@/utils/supabase/server";

import { POST_BATCH_SIZE } from "@/lib/app/constants";
import { FLARE_SELECT } from "@/lib/flares/types";
import type { FeedFilter } from "@/lib/feed/feed-filters";

import {
  FEED_POST_SELECT,
  dedupeAndSortPosts,
  mergeFeedItems,
  type FeedFlare,
  type FeedItem,
  type FeedPost,
} from "./types";

const FEED_COLLECT_LIMIT = 200;

export type FeedResult = {
  items: FeedItem[];
  usedFallback: boolean;
  hasMore: boolean;
  filter: FeedFilter;
};

export type FeedPagination = {
  limit?: number;
  offset?: number;
  filter?: FeedFilter;
};

function dedupeFlares(flares: FeedFlare[]): FeedFlare[] {
  const byId = new Map<string, FeedFlare>();

  for (const flare of flares) {
    byId.set(flare.id, flare);
  }

  return [...byId.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function applyPostFilter(
  posts: FeedPost[],
  filter: FeedFilter,
  followingIds: string[]
): FeedPost[] {
  switch (filter) {
    case "flares":
      return [];
    case "shipped":
      return posts.filter((post) => post.type === "shipped");
    case "following":
      return posts.filter((post) => followingIds.includes(post.author_id));
  }

  return posts;
}

function applyFlareFilter(flares: FeedFlare[], filter: FeedFilter, followingIds: string[]): FeedFlare[] {
  switch (filter) {
    case "flares":
      return flares;
    case "shipped":
      return [];
    case "following":
      return flares.filter((flare) => followingIds.includes(flare.author_id));
    default:
      return flares;
  }
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
  let collectedFlares: FeedFlare[] = [];

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
  let tagMatchedFlareIds: string[] = [];

  if (userTagIds.length > 0) {
    const [{ data: projectTags }, { data: flareTags }] = await Promise.all([
      supabase.from("project_tags").select("project_id").in("tag_id", userTagIds),
      supabase.from("flare_tags").select("flare_id").in("tag_id", userTagIds),
    ]);

    tagMatchedProjectIds = [...new Set(projectTags?.map((row) => row.project_id) ?? [])];
    tagMatchedFlareIds = [...new Set(flareTags?.map((row) => row.flare_id) ?? [])];
  }

  if (filter === "following") {
    if (followingIds.length > 0) {
      const [{ data: posts }, { data: flares }] = await Promise.all([
        supabase
          .from("posts")
          .select(FEED_POST_SELECT)
          .in("author_id", followingIds)
          .order("created_at", { ascending: false })
          .limit(FEED_COLLECT_LIMIT),
        supabase
          .from("flares")
          .select(FLARE_SELECT)
          .in("author_id", followingIds)
          .neq("status", "resolved")
          .order("created_at", { ascending: false })
          .limit(FEED_COLLECT_LIMIT),
      ]);

      if (posts) collected.push(...(posts as FeedPost[]));
      if (flares) collectedFlares.push(...(flares as FeedFlare[]));
    }
  } else if (filter === "flares") {
    const { data: flares } = await supabase
      .from("flares")
      .select(FLARE_SELECT)
      .neq("status", "resolved")
      .order("created_at", { ascending: false })
      .limit(FEED_COLLECT_LIMIT);

    collectedFlares = (flares ?? []) as FeedFlare[];
  } else {
    if (followingIds.length > 0) {
      const { data } = await supabase
        .from("posts")
        .select(FEED_POST_SELECT)
        .in("author_id", followingIds)
        .order("created_at", { ascending: false })
        .limit(FEED_COLLECT_LIMIT);

      if (data) collected.push(...(data as FeedPost[]));
    }

    const [{ data: ownPosts }, { data: ownFlares }] = await Promise.all([
      supabase
        .from("posts")
        .select(FEED_POST_SELECT)
        .eq("author_id", userId)
        .order("created_at", { ascending: false })
        .limit(FEED_COLLECT_LIMIT),
      supabase
        .from("flares")
        .select(FLARE_SELECT)
        .eq("author_id", userId)
        .neq("status", "resolved")
        .order("created_at", { ascending: false })
        .limit(FEED_COLLECT_LIMIT),
    ]);

    if (ownPosts) collected.push(...(ownPosts as FeedPost[]));
    if (ownFlares) collectedFlares.push(...(ownFlares as FeedFlare[]));

    if (tagMatchedProjectIds.length > 0) {
      const { data } = await supabase
        .from("posts")
        .select(FEED_POST_SELECT)
        .in("project_id", tagMatchedProjectIds)
        .order("created_at", { ascending: false })
        .limit(FEED_COLLECT_LIMIT);

      if (data) collected.push(...(data as FeedPost[]));
    }

    if (tagMatchedFlareIds.length > 0) {
      const { data: flares } = await supabase
        .from("flares")
        .select(FLARE_SELECT)
        .in("id", tagMatchedFlareIds)
        .neq("status", "resolved")
        .order("created_at", { ascending: false })
        .limit(FEED_COLLECT_LIMIT);

      if (flares) collectedFlares.push(...(flares as FeedFlare[]));
    }

    if (filter === "all") {
      const { data: recentFlares } = await supabase
        .from("flares")
        .select(FLARE_SELECT)
        .neq("status", "resolved")
        .order("created_at", { ascending: false })
        .limit(FEED_COLLECT_LIMIT);

      if (recentFlares) collectedFlares.push(...(recentFlares as FeedFlare[]));
    }
  }

  const dedupedPosts = applyPostFilter(dedupeAndSortPosts(collected), filter, followingIds);
  const dedupedFlares = applyFlareFilter(dedupeFlares(collectedFlares), filter, followingIds);
  let merged = mergeFeedItems(dedupedPosts, dedupedFlares).slice(0, FEED_COLLECT_LIMIT);

  if (merged.length > 0 || filter !== "all") {
    const page = merged.slice(offset, offset + limit);

    return {
      items: page,
      usedFallback: false,
      hasMore: merged.length > offset + limit,
      filter,
    };
  }

  const [{ data: fallbackPosts, error: postsError }, { data: fallbackFlares, error: flaresError }] =
    await Promise.all([
      supabase
        .from("posts")
        .select(FEED_POST_SELECT)
        .order("created_at", { ascending: false })
        .limit(FEED_COLLECT_LIMIT),
      supabase
        .from("flares")
        .select(FLARE_SELECT)
        .neq("status", "resolved")
        .order("created_at", { ascending: false })
        .limit(FEED_COLLECT_LIMIT),
    ]);

  if (postsError) throw new Error(postsError.message);
  if (flaresError) throw new Error(flaresError.message);

  merged = mergeFeedItems(
    applyPostFilter((fallbackPosts ?? []) as FeedPost[], filter, followingIds),
    applyFlareFilter((fallbackFlares ?? []) as FeedFlare[], filter, followingIds)
  );
  const page = merged.slice(offset, offset + limit);

  return {
    items: page,
    usedFallback: true,
    hasMore: merged.length > offset + limit,
    filter,
  };
}
