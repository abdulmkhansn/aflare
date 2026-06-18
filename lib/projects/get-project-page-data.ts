import type { BookmarksContext } from "@/lib/bookmarks/types";
import { collectBookmarkTargetsFromPosts } from "@/lib/bookmarks/collect-bookmark-targets";
import { getBookmarksContext } from "@/lib/bookmarks/get-bookmarks";
import { getCommentsForPosts } from "@/lib/comments/get-comments-for-posts";
import { FEED_POST_SELECT, type FeedPost } from "@/lib/feed/types";
import { getPostReactionsForPosts } from "@/lib/reactions/get-post-reactions";
import { createClient } from "@/utils/supabase/server";

import {
  PROJECT_STAGE_EVENT_SELECT,
  type ProjectStageEvent,
} from "./stage-events";
import {
  mergeProjectTimeline,
  type ProjectTimelineEntry,
  type ProjectTimelineFlare,
} from "./project-timeline";

export type ProjectOwnerProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  deleted?: boolean | null;
};

export type ProjectPageProject = {
  id: string;
  name: string;
  one_liner: string;
  stage: string;
  abstract_description: string | null;
  owner_id: string;
  owner: ProjectOwnerProfile | null;
  tags: { id: string; label: string }[];
};

export type ProjectPageData = {
  project: ProjectPageProject;
  timeline: ProjectTimelineEntry[];
  commentsByPostId: Awaited<ReturnType<typeof getCommentsForPosts>>["commentsByPostId"];
  markedCommentIds: Set<string>;
  reactionsContext: Awaited<ReturnType<typeof getPostReactionsForPosts>>;
  bookmarksContext: BookmarksContext;
};

export async function getProjectPageData(
  projectId: string,
  currentUserId: string
): Promise<ProjectPageData | null> {
  const supabase = await createClient();

  const { data: projectRow, error: projectError } = await supabase
    .from("projects")
    .select(
      `
      id,
      name,
      one_liner,
      stage,
      abstract_description,
      owner_id,
      profiles:owner_id ( id, display_name, avatar_url, deleted )
    `
    )
    .eq("id", projectId)
    .maybeSingle();

  if (projectError || !projectRow) {
    return null;
  }

  const ownerProfile = Array.isArray(projectRow.profiles)
    ? projectRow.profiles[0]
    : projectRow.profiles;

  const [{ data: projectTags }, { data: posts }, { data: stageEvents }, { data: flares }] =
    await Promise.all([
      supabase
        .from("project_tags")
        .select("tag_id, tags ( id, label )")
        .eq("project_id", projectId),
      supabase
        .from("posts")
        .select(FEED_POST_SELECT)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
      supabase
        .from("project_stage_events")
        .select(PROJECT_STAGE_EVENT_SELECT)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
      supabase
        .from("flares")
        .select("id, title, body, status, created_at, resolved_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
    ]);

  const tags =
    projectTags?.flatMap((row) => {
      const tag = Array.isArray(row.tags) ? row.tags[0] : row.tags;
      return tag ? [{ id: tag.id, label: tag.label }] : [];
    }) ?? [];

  const feedPosts = (posts ?? []) as FeedPost[];
  const postIds = feedPosts.map((post) => post.id);
  const timelineFlareIds = (flares ?? []).map((flare) => flare.id);
  const bookmarkTargets = {
    ...collectBookmarkTargetsFromPosts(feedPosts),
    flareIds: timelineFlareIds,
  };

  const [{ commentsByPostId, markedCommentIds }, reactionsContext, bookmarksContext] =
    await Promise.all([
      getCommentsForPosts(postIds, currentUserId),
      getPostReactionsForPosts(postIds, currentUserId),
      getBookmarksContext(currentUserId, bookmarkTargets),
    ]);

  const timeline = mergeProjectTimeline(
    feedPosts,
    (stageEvents ?? []) as ProjectStageEvent[],
    (flares ?? []) as ProjectTimelineFlare[]
  );

  return {
    project: {
      id: projectRow.id,
      name: projectRow.name,
      one_liner: projectRow.one_liner,
      stage: projectRow.stage,
      abstract_description: projectRow.abstract_description,
      owner_id: projectRow.owner_id,
      owner: ownerProfile
        ? {
            id: ownerProfile.id,
            display_name: ownerProfile.display_name,
            avatar_url: ownerProfile.avatar_url,
            deleted: ownerProfile.deleted,
          }
        : null,
      tags,
    },
    timeline,
    commentsByPostId,
    markedCommentIds,
    reactionsContext,
    bookmarksContext,
  };
}
