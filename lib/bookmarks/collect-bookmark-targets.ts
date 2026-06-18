import { resolveFeedArticle } from "@/lib/articles/types";
import type { FeedItem, FeedPost } from "@/lib/feed/types";
import { resolvePostKind } from "@/lib/posts/kinds";

export function collectBookmarkTargets(items: FeedItem[], posts: FeedPost[]) {
  const postIds: string[] = [];
  const flareIds: string[] = [];
  const articleIds: string[] = [];

  for (const item of items) {
    if (item.kind === "flare") {
      flareIds.push(item.flare.id);
    }
  }

  for (const post of posts) {
    if (resolvePostKind(post) === "article") {
      const article = resolveFeedArticle(post);

      if (article) {
        articleIds.push(article.id);
      }

      continue;
    }

    postIds.push(post.id);
  }

  return { postIds, flareIds, articleIds };
}

export function collectBookmarkTargetsFromPosts(posts: FeedPost[]) {
  const postIds: string[] = [];
  const articleIds: string[] = [];

  for (const post of posts) {
    if (resolvePostKind(post) === "article") {
      const article = resolveFeedArticle(post);

      if (article) {
        articleIds.push(article.id);
      }

      continue;
    }

    postIds.push(post.id);
  }

  return { postIds, articleIds };
}
