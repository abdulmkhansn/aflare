import { parseArticleBody } from "@/lib/articles/types";
import type { SavedItem } from "@/lib/bookmarks/types";
import { bookmarkRowKey } from "@/lib/bookmarks/types";
import { FEED_POST_SELECT, resolveFeedPostRelations, type FeedPost } from "@/lib/feed/types";
import { flareExcerpt, FLARE_SELECT, resolveFlareAuthor, type FlareListItem } from "@/lib/flares/types";
import { mentionPlainText } from "@/lib/mentions/parse-mentions";
import { profileDisplayName } from "@/lib/profiles/public-fields";
import { createClient } from "@/utils/supabase/server";

function postHref(post: FeedPost): string {
  if (post.project_id) {
    return `/projects/${post.project_id}#post-${post.id}`;
  }

  return `/#post-${post.id}`;
}

function postTitle(post: FeedPost): string {
  const body = mentionPlainText(post.body?.trim() ?? "");

  if (!body) {
    return "Post";
  }

  return body.length > 80 ? `${body.slice(0, 77)}…` : body;
}

function postExcerpt(post: FeedPost): string {
  const body = mentionPlainText(post.body?.trim() ?? "");
  return body.length > 160 ? `${body.slice(0, 157)}…` : body;
}

export async function getSavedItems(userId: string): Promise<SavedItem[]> {
  const supabase = await createClient();

  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select("created_at, post_id, flare_id, article_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!bookmarks?.length) {
    return [];
  }

  const postIds = bookmarks.map((row) => row.post_id).filter(Boolean) as string[];
  const flareIds = bookmarks.map((row) => row.flare_id).filter(Boolean) as string[];
  const articleIds = bookmarks.map((row) => row.article_id).filter(Boolean) as string[];

  const [{ data: posts }, { data: flares }, { data: articles }] = await Promise.all([
    postIds.length
      ? supabase.from("posts").select(FEED_POST_SELECT).in("id", postIds)
      : Promise.resolve({ data: [] as FeedPost[] }),
    flareIds.length
      ? supabase.from("flares").select(FLARE_SELECT).in("id", flareIds)
      : Promise.resolve({ data: [] as FlareListItem[] }),
    articleIds.length
      ? supabase
          .from("articles")
          .select(
            `
            id,
            title,
            excerpt,
            body,
            cover_image_url,
            helpful_count,
            created_at,
            author_id,
            profiles:author_id ( display_name, avatar_url, deleted, verified_builder )
          `
          )
          .in("id", articleIds)
      : Promise.resolve({ data: [] }),
  ]);

  const postsById = new Map((posts ?? []).map((post) => [post.id, post as FeedPost]));
  const flaresById = new Map((flares ?? []).map((flare) => [flare.id, flare as FlareListItem]));
  const articlesById = new Map((articles ?? []).map((article) => [article.id, article]));

  const items: SavedItem[] = [];

  for (const bookmark of bookmarks) {
    if (bookmark.post_id) {
      const post = postsById.get(bookmark.post_id);

      if (!post) {
        continue;
      }

      const { profile } = resolveFeedPostRelations(post);

      items.push({
        kind: "post",
        bookmarkId: bookmarkRowKey(bookmark),
        savedAt: bookmark.created_at,
        postId: post.id,
        title: postTitle(post),
        excerpt: postExcerpt(post),
        authorName: profileDisplayName(profile),
        href: postHref(post),
      });

      continue;
    }

    if (bookmark.flare_id) {
      const flare = flaresById.get(bookmark.flare_id);

      if (!flare) {
        continue;
      }

      const author = resolveFlareAuthor(flare);
      const title = flare.title?.trim() || flareExcerpt(flare, 80);
      const excerpt = flareExcerpt(flare, 160);

      items.push({
        kind: "flare",
        bookmarkId: bookmarkRowKey(bookmark),
        savedAt: bookmark.created_at,
        flareId: flare.id,
        title,
        excerpt,
        authorName: profileDisplayName(author),
        href: `/flarespace/${flare.id}`,
      });

      continue;
    }

    if (bookmark.article_id) {
      const article = articlesById.get(bookmark.article_id);

      if (!article) {
        continue;
      }

      const profile = Array.isArray(article.profiles) ? article.profiles[0] : article.profiles;
      const parsed = parseArticleBody(article.body ?? "");
      const excerpt =
        article.excerpt?.trim() ||
        (parsed.kind === "document" ? parsed.description?.trim() : null) ||
        "";

      items.push({
        kind: "article",
        bookmarkId: bookmarkRowKey(bookmark),
        savedAt: bookmark.created_at,
        articleId: article.id,
        title: article.title,
        excerpt,
        authorName: profileDisplayName(profile),
        href: `/articles/${article.id}`,
      });
    }
  }

  return items;
}
