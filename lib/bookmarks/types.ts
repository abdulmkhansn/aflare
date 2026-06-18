export const BOOKMARK_TARGET_TYPES = ["post", "flare", "article"] as const;

export type BookmarkTargetType = (typeof BOOKMARK_TARGET_TYPES)[number];

export type BookmarksContext = {
  postIds: Set<string>;
  flareIds: Set<string>;
  articleIds: Set<string>;
};

export function emptyBookmarksContext(): BookmarksContext {
  return {
    postIds: new Set(),
    flareIds: new Set(),
    articleIds: new Set(),
  };
}

export type SavedBookmarkRow = {
  created_at: string;
  post_id: string | null;
  flare_id: string | null;
  article_id: string | null;
};

export function bookmarkRowKey(row: SavedBookmarkRow): string {
  if (row.post_id) {
    return `post:${row.post_id}`;
  }

  if (row.flare_id) {
    return `flare:${row.flare_id}`;
  }

  return `article:${row.article_id}`;
}

export type SavedItem =
  | {
      kind: "post";
      bookmarkId: string;
      savedAt: string;
      postId: string;
      title: string;
      excerpt: string;
      authorName: string;
      href: string;
    }
  | {
      kind: "flare";
      bookmarkId: string;
      savedAt: string;
      flareId: string;
      title: string;
      excerpt: string;
      authorName: string;
      href: string;
    }
  | {
      kind: "article";
      bookmarkId: string;
      savedAt: string;
      articleId: string;
      title: string;
      excerpt: string;
      authorName: string;
      href: string;
    };
