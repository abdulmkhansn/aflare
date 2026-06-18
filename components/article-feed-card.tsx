import Link from "next/link";
import Image from "next/image";
import { IconFileText, IconFileTypePdf } from "@tabler/icons-react";

import { AuthorLink } from "@/components/avatar";
import { authorLinkProps } from "@/lib/profiles/public-fields";
import { BookmarkControl } from "@/components/bookmarks/bookmark-control";
import { MentionBody } from "@/components/mentions/mention-body";
import type { FeedPost } from "@/lib/feed/types";
import { resolveFeedPostRelations } from "@/lib/feed/types";
import { parseArticleBody, resolveFeedArticle } from "@/lib/articles/types";
import { hasMentionTokens } from "@/lib/mentions/parse-mentions";
import { formatRelativeTime } from "@/lib/time/relative-time";
import { focusRingClassName } from "@/lib/ui/classes";

type ArticleFeedCardProps = {
  post: FeedPost;
  isBookmarked?: boolean;
  bookmarkTarget?: { targetType: "post" | "article"; targetId: string } | null;
};

export function ArticleFeedCard({
  post,
  isBookmarked = false,
  bookmarkTarget,
}: ArticleFeedCardProps) {
  const { profile } = resolveFeedPostRelations(post);
  const article = resolveFeedArticle(post);

  if (!article) {
    return null;
  }

  const parsed = parseArticleBody(article.body);
  const isDocument = parsed.kind === "document";
  const excerpt =
    article.excerpt?.trim() ||
    (isDocument ? parsed.description : null) ||
    post.body?.trim() ||
    "";
  const excerptFromPostBody = !article.excerpt?.trim() && !isDocument && Boolean(post.body?.trim());
  const excerptHasMentions = excerptFromPostBody && hasMentionTokens(excerpt);

  return (
    <article className="overflow-hidden rounded-lg border border-border-subtle bg-surface-card shadow-[var(--elevation-card)]">
      {article.cover_image_url ? (
        <div className="relative aspect-[2/1] border-b border-border-subtle bg-[var(--hover-subtle)]">
          <Image
            src={article.cover_image_url}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : isDocument ? (
        <div className="flex items-center gap-3 border-b border-border-subtle bg-[var(--hover-subtle)] px-5 py-6">
          {parsed.doc_type === "pdf" ? (
            <IconFileTypePdf className="h-10 w-10 shrink-0 text-fg-muted" stroke={1.5} />
          ) : (
            <IconFileText className="h-10 w-10 shrink-0 text-fg-muted" stroke={1.5} />
          )}
          <p className="text-sm text-fg-muted">
            {parsed.doc_type === "pdf" ? "PDF article" : "Word document"}
          </p>
        </div>
      ) : null}

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <AuthorLink {...authorLinkProps(post.author_id, profile)} />
            <time className="mt-1 block text-xs text-fg-muted" dateTime={post.created_at}>
              {formatRelativeTime(post.created_at)}
            </time>
          </div>
          <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--badge-neutral-bg)] px-2 py-0.5 text-xs font-medium text-fg-muted">
            Article
          </span>
        </div>

        <div className="space-y-2">
          <Link
            href={`/articles/${article.id}`}
            className={`block text-lg font-medium leading-snug text-fg hover:underline ${focusRingClassName}`}
          >
            {article.title}
          </Link>
          {excerpt ? (
            excerptHasMentions ? (
              <MentionBody
                body={excerpt}
                className="line-clamp-3 text-sm leading-relaxed text-fg-muted"
              />
            ) : (
              <p className="line-clamp-3 text-sm leading-relaxed text-fg-muted">{excerpt}</p>
            )
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/articles/${article.id}`}
            className={`inline-flex text-sm font-medium text-teal hover:underline ${focusRingClassName}`}
          >
            Read article
          </Link>

          {bookmarkTarget ? (
            <BookmarkControl
              targetType={bookmarkTarget.targetType}
              targetId={bookmarkTarget.targetId}
              isSaved={isBookmarked}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
