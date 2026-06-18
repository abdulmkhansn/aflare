import Link from "next/link";

import { AuthorLink } from "@/components/avatar";
import { authorLinkProps } from "@/lib/profiles/public-fields";
import { FlareStatusBadge } from "@/components/flare-status-badge";
import {
  flareBodyRedundantWithTitle,
  resolveFlareAuthor,
  resolveFlareTags,
  type FlareListItem,
} from "@/lib/flares/types";
import { formatTagLabel } from "@/lib/tags/format-tag-label";
import { focusRingClassName, tagPillClassName, textLinkClassName } from "@/lib/ui/classes";

type EmbeddedFlareCardProps = {
  flare: FlareListItem;
  currentUserId?: string;
};

export function EmbeddedFlareCard({ flare, currentUserId }: EmbeddedFlareCardProps) {
  const author = resolveFlareAuthor(flare);
  const tags = resolveFlareTags(flare);
  const title = flare.title?.trim();
  const body = flare.body?.trim() ?? "";
  const showBody = Boolean(body) && !(title && flareBodyRedundantWithTitle(title, body));
  const showHelpLink =
    Boolean(currentUserId) &&
    flare.status !== "resolved" &&
    flare.author_id !== currentUserId;

  return (
    <div className="rounded-lg border border-border-subtle bg-[var(--hover-subtle)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <AuthorLink {...authorLinkProps(flare.author_id, author)} />
          {title ? <p className="mt-2 text-sm font-medium text-fg">{title}</p> : null}
          {showBody ? (
            <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-fg-muted">{body}</p>
          ) : null}
        </div>
        <FlareStatusBadge status={flare.status} />
      </div>

      {tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag.id} className={tagPillClassName}>
              {formatTagLabel(tag.label)}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link href={`/flarespace/${flare.id}`} className={`text-sm ${textLinkClassName}`}>
          View in Flarespace
        </Link>
        {showHelpLink ? (
          <Link
            href={`/flarespace/${flare.id}`}
            className={`text-sm ${textLinkClassName} ${focusRingClassName}`}
          >
            I can help
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function embeddedFlareUnavailableCopy(): string {
  return "This flare is no longer available.";
}
