import Link from "next/link";

import { BookmarkControl } from "@/components/bookmarks/bookmark-control";
import { ContentActionRow } from "@/components/content-action-row";
import { FlareStatusBadge } from "@/components/flare-status-badge";
import { flareTimelineTitle } from "@/lib/projects/project-timeline";
import type { ProjectTimelineFlare } from "@/lib/projects/project-timeline";
import { formatRelativeTime } from "@/lib/time/relative-time";
import { cardClassName, focusRingClassName } from "@/lib/ui/classes";

type TimelineFlareEntryProps = {
  flare: ProjectTimelineFlare;
  isBookmarked?: boolean;
};

export function TimelineFlareEntry({ flare, isBookmarked = false }: TimelineFlareEntryProps) {
  const title = flareTimelineTitle(flare);
  const resolved = flare.status === "resolved";

  return (
    <div className={`${cardClassName} border-ember/25`}>
      <Link
        href={`/flarespace/${flare.id}`}
        className={`block transition-colors hover:opacity-90 ${focusRingClassName}`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm leading-snug text-fg">
            {resolved ? (
              <>
                Got stuck on <span className="font-medium">{title}</span>
                <span className="text-fg-muted"> → resolved</span>
              </>
            ) : (
              <>
                Got stuck: <span className="font-medium">{title}</span>
              </>
            )}
          </p>
          <FlareStatusBadge status={flare.status} />
        </div>
        <time className="mt-1.5 block text-xs text-fg-muted" dateTime={flare.created_at}>
          {formatRelativeTime(flare.created_at)}
        </time>
      </Link>

      <ContentActionRow>
        <Link
          href={`/flarespace/${flare.id}`}
          className={`inline-flex h-8 items-center gap-1 rounded-full border border-border-subtle px-2.5 text-xs font-medium text-fg-muted transition-colors hover:border-fg/20 hover:text-fg ${focusRingClassName}`}
        >
          View flare
        </Link>
        <BookmarkControl targetType="flare" targetId={flare.id} isSaved={isBookmarked} showLabel={false} />
      </ContentActionRow>
    </div>
  );
}
