import type { FeedPost } from "@/lib/feed/types";
import { resolveFeedPostRelations } from "@/lib/feed/types";

import { resolvePostKind } from "./kinds";
import { isBoostPost } from "./boost";
import { parseStructuredFields, type PostStructuredFields } from "./structured-fields";

export function isRepostMarker(fields: PostStructuredFields): boolean {
  return fields.repost === true;
}

export function isRepostPost(post: Pick<FeedPost, "reposted_post_id" | "structured_fields">): boolean {
  if (post.reposted_post_id) {
    return true;
  }

  return isRepostMarker(parseStructuredFields(post.structured_fields));
}

export function resolveRepostedPost(post: FeedPost): FeedPost | null {
  if (!post.reposted_post) {
    return null;
  }

  return Array.isArray(post.reposted_post) ? post.reposted_post[0] : post.reposted_post;
}

export function isRepostOriginalUnavailable(post: FeedPost): boolean {
  return isRepostPost(post) && !resolveRepostedPost(post);
}

export function buildRepostStructuredFields(): PostStructuredFields {
  return { repost: true };
}

export function getPostPermalink(post: Pick<FeedPost, "id" | "project_id" | "kind" | "article_id">): string {
  const kind = resolvePostKind(post);

  if (post.project_id) {
    return `/projects/${post.project_id}`;
  }

  if (kind === "article" && post.article_id) {
    return `/articles/${post.article_id}`;
  }

  return `/?post=${post.id}`;
}

export function repostHeaderLabel(displayName: string | null | undefined): string {
  const name = displayName?.trim() || "Someone";
  return `${name} reposted`;
}

export function canRepostPost(
  post: Pick<
    FeedPost,
    "author_id" | "kind" | "article_id" | "reposted_post_id" | "boosted_flare_id" | "structured_fields"
  >,
  currentUserId: string
): boolean {
  if (post.author_id === currentUserId) {
    return false;
  }

  if (resolvePostKind(post) === "article") {
    return false;
  }

  if (isBoostPost(post)) {
    return false;
  }

  return true;
}

export function resolveRepostQuoteAuthor(post: FeedPost) {
  return resolveFeedPostRelations(post).profile;
}
