import Link from "next/link";

import { AuthorLink } from "@/components/avatar";
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
};

export function FlareFeedCard({ flare }: FlareFeedCardProps) {
  const author = resolveFlareAuthor(flare);
  const helpers = resolveFlareHelpers(flare);
  const title = flare.title?.trim();
  const body = flare.body?.trim() ?? "";
  const showBody = Boolean(body) && !(title && flareBodyRedundantWithTitle(title, body));

  return (
    <article className={`${cardClassName} border-ember/20`}>
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

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href={`/flarespace/${flare.id}`}
          className={`text-sm font-medium text-fg hover:underline ${focusRingClassName}`}
        >
          View in Flarespace
        </Link>
        {helpers.length > 0 ? (
          <span className="text-xs text-fg-muted">
            {helpers.length} {helpers.length === 1 ? "helper" : "helpers"}
          </span>
        ) : null}
      </div>
    </article>
  );
}
