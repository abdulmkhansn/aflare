import Link from "next/link";

import { AuthorLink } from "@/components/avatar";
import { authorLinkProps } from "@/lib/profiles/public-fields";
import { BookmarkControl } from "@/components/bookmarks/bookmark-control";
import { ContentActionRow } from "@/components/content-action-row";
import { MentionBody } from "@/components/mentions/mention-body";
import { FlareStatusBadge } from "@/components/flare-status-badge";
import {
  flareBodyRedundantWithTitle,
  resolveFlareAuthor,
  resolveFlareHelpers,
  type FlareListItem,
} from "@/lib/flares/types";
import { formatRelativeTime } from "@/lib/time/relative-time";
import { cardClassName, focusRingClassName } from "@/lib/ui/classes";

type FlareFeedCardProps = {
  flare: FlareListItem;
  isBookmarked?: boolean;
};

export function FlareFeedCard({ flare, isBookmarked = false }: FlareFeedCardProps) {
  const author = resolveFlareAuthor(flare);
  const helpers = resolveFlareHelpers(flare);
  const title = flare.title?.trim();
  const body = flare.body?.trim() ?? "";
  const showBody = Boolean(body) && !(title && flareBodyRedundantWithTitle(title, body));

  return (
    <article className={`${cardClassName} border-ember/20`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <AuthorLink {...authorLinkProps(flare.author_id, author)} />
          <time className="mt-1 block text-xs text-fg-muted" dateTime={flare.created_at}>
            {formatRelativeTime(flare.created_at)}
          </time>
        </div>
        <FlareStatusBadge status={flare.status} />
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ember">Flare</p>
        {title ? <h3 className="mt-1 text-sm font-medium text-fg">{title}</h3> : null}
        {showBody ? (
          <MentionBody
            body={body}
            className="mt-2 line-clamp-4 text-sm leading-relaxed text-fg"
          />
        ) : null}
      </div>

      <ContentActionRow>
        <Link
          href={`/flarespace/${flare.id}`}
          className={`inline-flex h-8 items-center gap-1 rounded-full border border-border-subtle px-2.5 text-xs font-medium text-fg-muted transition-colors hover:border-fg/20 hover:text-fg ${focusRingClassName}`}
        >
          View flare
        </Link>
        {helpers.length > 0 ? (
          <span className="inline-flex h-8 items-center px-1 text-xs text-fg-muted">
            {helpers.length} {helpers.length === 1 ? "helper" : "helpers"}
          </span>
        ) : null}
        <BookmarkControl targetType="flare" targetId={flare.id} isSaved={isBookmarked} showLabel={false} />
      </ContentActionRow>
    </article>
  );
}
