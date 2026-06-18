import { resolveFeedArticle } from "@/lib/articles/types";
import type { BookmarksContext } from "@/lib/bookmarks/types";
import type { FeedPost } from "@/lib/feed/types";
import { resolvePostKind } from "@/lib/posts/kinds";

export function isPostBookmarked(post: FeedPost, context: BookmarksContext): boolean {
  if (resolvePostKind(post) === "article") {
    const article = resolveFeedArticle(post);
    return article ? context.articleIds.has(article.id) : false;
  }

  return context.postIds.has(post.id);
}

export function getPostBookmarkTarget(post: FeedPost): {
  targetType: "post" | "article";
  targetId: string;
} | null {
  if (resolvePostKind(post) === "article") {
    const article = resolveFeedArticle(post);
    return article ? { targetType: "article", targetId: article.id } : null;
  }

  return { targetType: "post", targetId: post.id };
}
