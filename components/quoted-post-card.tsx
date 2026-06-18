import Link from "next/link";

import { AuthorLink } from "@/components/avatar";
import { authorLinkProps, profileDisplayName } from "@/lib/profiles/public-fields";
import { ContentTimestamp } from "@/components/content-timestamp";
import { MentionBody } from "@/components/mentions/mention-body";
import { PostMedia } from "@/components/post-media";
import { PostTypeBadge } from "@/components/post-type-badge";
import type { FeedPost } from "@/lib/feed/types";
import { resolveFeedPostRelations } from "@/lib/feed/types";
import { resolvePostKind } from "@/lib/posts/kinds";
import { getPostPermalink } from "@/lib/posts/repost";
import { parseStructuredFields } from "@/lib/posts/structured-fields";
import { textLinkClassName } from "@/lib/ui/classes";

type QuotedPostCardProps = {
  post: FeedPost;
};

export function QuotedPostCard({ post }: QuotedPostCardProps) {
  const { profile, project } = resolveFeedPostRelations(post);
  const kind = resolvePostKind(post);
  const fields = parseStructuredFields(post.structured_fields);
  const permalink = getPostPermalink(post);

  if (kind === "article") {
    const article = Array.isArray(post.articles) ? post.articles[0] : post.articles;

    return (
      <div className="rounded-lg border border-border-subtle bg-[var(--hover-subtle)] p-3">
        <AuthorLink {...authorLinkProps(post.author_id, profile)} />
        <p className="mt-2 text-sm font-medium text-fg">{article?.title ?? "Article"}</p>
        {article?.excerpt ? (
          <p className="mt-1 text-sm leading-relaxed text-fg-muted">{article.excerpt}</p>
        ) : null}
        <Link href={permalink} className={`mt-2 inline-block text-sm ${textLinkClassName}`}>
          View original
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-[var(--hover-subtle)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <AuthorLink {...authorLinkProps(post.author_id, profile)} />
          <ContentTimestamp
            createdAt={post.created_at}
            editedAt={post.edited_at}
            className="mt-1 block text-xs text-fg-muted"
          />
        </div>
        {kind === "build" ? <PostTypeBadge type={post.type} /> : null}
      </div>

      {project ? (
        <p className="mt-2 text-sm font-medium text-fg">{project.name}</p>
      ) : null}

      {post.body ? (
        <div className="mt-2">
          <MentionBody body={post.body} />
        </div>
      ) : null}

      <PostMedia fields={fields} />

      <Link href={permalink} className={`mt-3 inline-block text-sm ${textLinkClassName}`}>
        View original
      </Link>
    </div>
  );
}
