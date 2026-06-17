import type { FeedArticleSummary } from "@/lib/articles/types";
import type { PostStructuredFields } from "@/lib/posts/structured-fields";

export type FeedPost = {
  id: string;
  type: string;
  kind: string | null;
  body: string;
  created_at: string;
  author_id: string;
  project_id: string | null;
  article_id: string | null;
  structured_fields: PostStructuredFields | Record<string, unknown> | null;
  profiles:
    | {
        display_name: string | null;
        avatar_url: string | null;
      }
    | {
        display_name: string | null;
        avatar_url: string | null;
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
};

export function resolveFeedPostRelations(post: FeedPost) {
  const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
  const project = Array.isArray(post.projects) ? post.projects[0] : post.projects;

  return { profile, project };
}

export const FEED_POST_SELECT = `
  id,
  type,
  kind,
  body,
  created_at,
  author_id,
  project_id,
  article_id,
  structured_fields,
  profiles:author_id ( display_name, avatar_url ),
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

export function dedupeAndSortPosts(posts: FeedPost[]): FeedPost[] {
  const byId = new Map<string, FeedPost>();

  for (const post of posts) {
    byId.set(post.id, post);
  }

  return [...byId.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
