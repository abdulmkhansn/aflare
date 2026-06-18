import Link from "next/link";

import { FlareStatusBadge } from "@/components/flare-status-badge";
import { flareTimelineTitle } from "@/lib/projects/project-timeline";
import type { ProjectTimelineFlare } from "@/lib/projects/project-timeline";
import { formatRelativeTime } from "@/lib/time/relative-time";
import { focusRingClassName } from "@/lib/ui/classes";

type TimelineFlareEntryProps = {
  flare: ProjectTimelineFlare;
};

export function TimelineFlareEntry({ flare }: TimelineFlareEntryProps) {
  const title = flareTimelineTitle(flare);
  const resolved = flare.status === "resolved";

  return (
    <Link
      href={`/flarespace/${flare.id}`}
      className={`block rounded-lg border border-ember/25 bg-surface-card px-4 py-3 shadow-[var(--elevation-card)] transition-colors hover:border-ember/40 ${focusRingClassName}`}
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
  );
}
