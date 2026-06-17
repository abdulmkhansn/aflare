import Link from "next/link";

import { AuthorLink } from "@/components/avatar";
import { FlareCommentsSection } from "@/components/flare-comments-section";
import { FlareHelpersSection } from "@/components/flare-helpers-section";
import { FlareResolveActions } from "@/components/flare-resolve-actions";
import { FlareStatePanel } from "@/components/flare-state-panel";
import { FlareStatusBadge } from "@/components/flare-status-badge";
import { PostMedia } from "@/components/post-media";
import type { FlareDetail } from "@/lib/flares/get-flare-detail";
import { resolveFlareAuthor, resolveFlareTags } from "@/lib/flares/types";
import { parseStructuredFields } from "@/lib/posts/structured-fields";
import { formatTagLabel } from "@/lib/tags/format-tag-label";
import { formatRelativeTime } from "@/lib/time/relative-time";
import {
  cardClassName,
  errorTextClassName,
  focusRingClassName,
  inlineLinkClassName,
  tagPillClassName,
} from "@/lib/ui/classes";

type FlareDetailViewProps = {
  detail: FlareDetail;
  currentUserId: string;
  redirectTo: string;
  statusMessages: {
    commentError?: string;
    helpfulError?: string;
    error?: string;
  };
};

export function FlareDetailView({
  detail,
  currentUserId,
  redirectTo,
  statusMessages,
}: FlareDetailViewProps) {
  const { flare, comments, markedCommentIds, isAuthor, isHelper } = detail;
  const author = resolveFlareAuthor(flare);
  const tags = resolveFlareTags(flare);
  const fields = parseStructuredFields(flare.structured_fields);
  const isResolved = flare.status === "resolved";

  return (
    <div className="space-y-4">
      {statusMessages.error ? (
        <p className={errorTextClassName} role="alert">
          {statusMessages.error}
        </p>
      ) : null}

      <article className={cardClassName}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <AuthorLink
              userId={flare.author_id}
              displayName={author?.display_name ?? null}
              avatarUrl={author?.avatar_url ?? null}
            />
            <time className="mt-1 block text-xs text-fg-muted" dateTime={flare.created_at}>
              {formatRelativeTime(flare.created_at)}
            </time>
          </div>
          <FlareStatusBadge status={flare.status} />
        </div>

        {flare.title?.trim() ? (
          <h1 className="mt-4 text-lg font-medium text-fg">{flare.title.trim()}</h1>
        ) : null}

        {flare.body ? (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-fg">{flare.body}</p>
        ) : null}

        <PostMedia fields={fields} />

        {tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/flarespace?tag=${tag.id}`}
                className={`${tagPillClassName} hover:opacity-80 ${focusRingClassName}`}
              >
                {formatTagLabel(tag.label)}
              </Link>
            ))}
          </div>
        ) : null}

        {isResolved && flare.resolution_note?.trim() ? (
          <div className="mt-5 rounded-md border border-border-subtle bg-[var(--hover-subtle)] p-4">
            <h2 className="text-sm font-medium text-fg">What solved it</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-fg">
              {flare.resolution_note.trim()}
            </p>
          </div>
        ) : null}
      </article>

      <FlareHelpersSection
        flare={flare}
        currentUserId={currentUserId}
        redirectTo={redirectTo}
        isHelper={isHelper}
      />

      <FlareStatePanel
        flareId={flare.id}
        tried={flare.tried}
        ruledOut={flare.ruled_out}
        currentStatus={flare.current_status}
        isAuthor={isAuthor}
      />

      <div className={cardClassName}>
        <FlareCommentsSection
          flareId={flare.id}
          comments={comments}
          markedCommentIds={markedCommentIds}
          flareAuthorId={flare.author_id}
          currentUserId={currentUserId}
          redirectTo={redirectTo}
          isResolved={isResolved}
          commentError={statusMessages.commentError}
          helpfulError={statusMessages.helpfulError}
          embedded
        />
      </div>

      {isAuthor ? (
        <FlareResolveActions flareId={flare.id} isResolved={isResolved} />
      ) : (
        <p className="text-xs text-fg-muted">
          <Link href="/flarespace" className={inlineLinkClassName}>
            Back to Flarespace
          </Link>
        </p>
      )}
    </div>
  );
}
