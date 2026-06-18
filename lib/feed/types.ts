import type { FeedArticleSummary } from "@/lib/articles/types";
import type { FlareListItem } from "@/lib/flares/types";
import type { PostStructuredFields } from "@/lib/posts/structured-fields";

export type FeedPost = {
  id: string;
  type: string;
  kind: string | null;
  body: string;
  created_at: string;
  edited_at: string | null;
  author_id: string;
  project_id: string | null;
  article_id: string | null;
  reposted_post_id: string | null;
  boosted_flare_id: string | null;
  structured_fields: PostStructuredFields | Record<string, unknown> | null;
  profiles:
    | {
        display_name: string | null;
        avatar_url: string | null;
        deleted?: boolean | null;
        verified_builder?: boolean | null;
      }
    | {
        display_name: string | null;
        avatar_url: string | null;
        deleted?: boolean | null;
        verified_builder?: boolean | null;
      }[]
    | null;
  projects:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;
  articles: FeedArticleSummary | FeedArticleSummary[] | null;
  reposted_post?: FeedPost | FeedPost[] | null;
  boosted_flare?: FeedFlare | FeedFlare[] | null;
};

export function resolveRepostedPostRelation(post: FeedPost): FeedPost | null {
  if (!post.reposted_post) {
    return null;
  }

  return Array.isArray(post.reposted_post) ? post.reposted_post[0] : post.reposted_post;
}

export function resolveFeedPostRelations(post: FeedPost) {
  const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
  const project = Array.isArray(post.projects) ? post.projects[0] : post.projects;

  return { profile, project };
}

export const REPOSTED_POST_SELECT = `
  id,
  type,
  kind,
  body,
  created_at,
  edited_at,
  author_id,
  project_id,
  article_id,
  reposted_post_id,
  boosted_flare_id,
  structured_fields,
  profiles:author_id ( display_name, avatar_url, deleted, verified_builder ),
  projects:project_id ( id, name ),
  articles:article_id (
    id,
    title,
    body,
    excerpt,
    cover_image_url,
    helpful_count
  )
`;

export const BOOSTED_FLARE_EMBED_SELECT = `
  id,
  author_id,
  title,
  body,
  status,
  created_at,
  profiles:author_id ( display_name, avatar_url, deleted, verified_builder ),
  flare_tags ( tag_id, tags ( id, label ) )
`;

export const FEED_POST_SELECT = `
  id,
  type,
  kind,
  body,
  created_at,
  edited_at,
  author_id,
  project_id,
  article_id,
  reposted_post_id,
  boosted_flare_id,
  structured_fields,
  profiles:author_id ( display_name, avatar_url, deleted, verified_builder ),
  projects:project_id ( id, name ),
  articles:article_id (
    id,
    title,
    body,
    excerpt,
    cover_image_url,
    helpful_count
  ),
  reposted_post:reposted_post_id (
    ${REPOSTED_POST_SELECT}
  ),
  boosted_flare:boosted_flare_id (
    ${BOOSTED_FLARE_EMBED_SELECT}
  )
`;

export function dedupeAndSortPosts(posts: FeedPost[]): FeedPost[] {
  const byId = new Map<string, FeedPost>();

  for (const post of posts) {
    byId.set(post.id, post);
  }

  return [...byId.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export type FeedFlare = FlareListItem;

export type FeedItem =
  | { kind: "post"; id: string; created_at: string; post: FeedPost }
  | { kind: "flare"; id: string; created_at: string; flare: FeedFlare };

export function mergeFeedItems(posts: FeedPost[], flares: FeedFlare[]): FeedItem[] {
  const items: FeedItem[] = [
    ...posts.map((post) => ({
      kind: "post" as const,
      id: post.id,
      created_at: post.created_at,
      post,
    })),
    ...flares.map((flare) => ({
      kind: "flare" as const,
      id: flare.id,
      created_at: flare.created_at,
      flare,
    })),
  ];

  return items.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
