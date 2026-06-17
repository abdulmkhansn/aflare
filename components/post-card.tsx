import Link from "next/link";

import { PostTypeBadge } from "@/components/post-type-badge";
import { PostMedia } from "@/components/post-media";
import { AuthorLink } from "@/components/avatar";
import type { FeedPost } from "@/lib/feed/types";
import { resolveFeedPostRelations } from "@/lib/feed/types";
import { isSharePost, resolvePostKind } from "@/lib/posts/kinds";
import { parseStructuredFields } from "@/lib/posts/structured-fields";
import { formatRelativeTime } from "@/lib/time/relative-time";
import { focusRingClassName } from "@/lib/ui/classes";

type PostCardProps = {
  post: FeedPost;
  embedded?: boolean;
};

export function PostCard({ post, embedded = false }: PostCardProps) {
  const { profile, project } = resolveFeedPostRelations(post);
  const kind = resolvePostKind(post);
  const share = isSharePost(post);
  const fields = parseStructuredFields(post.structured_fields);

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <AuthorLink
            userId={post.author_id}
            displayName={profile?.display_name ?? null}
            avatarUrl={profile?.avatar_url ?? null}
          />
          <time className="mt-1 block text-xs text-fg-muted" dateTime={post.created_at}>
            {formatRelativeTime(post.created_at)}
          </time>
        </div>
        {!share && kind !== "article" ? <PostTypeBadge type={post.type} /> : null}
        {kind === "article" ? (
          <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--badge-neutral-bg)] px-2 py-0.5 text-xs font-medium text-fg-muted">
            Article
          </span>
        ) : null}
      </div>

      {!share && project ? (
        <div className="mt-3">
          <Link
            href={`/projects/${project.id}`}
            className={`cursor-pointer text-sm font-medium text-fg hover:underline ${focusRingClassName}`}
          >
            {project.name}
          </Link>
        </div>
      ) : null}

      {post.body ? (
        <p className={`whitespace-pre-wrap text-sm leading-relaxed text-fg ${share || !project ? "mt-3" : "mt-3"}`}>
          {post.body}
        </p>
      ) : null}

      <PostMedia fields={fields} />
    </>
  );

  if (embedded) {
    return content;
  }

  return content;
}
