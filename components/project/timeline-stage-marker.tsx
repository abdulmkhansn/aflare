import { formatStageEventLabel, type ProjectStageEvent } from "@/lib/projects/stage-events";
import { formatRelativeTime } from "@/lib/time/relative-time";

type TimelineStageMarkerProps = {
  event: ProjectStageEvent;
};

export function TimelineStageMarker({ event }: TimelineStageMarkerProps) {
  return (
    <div className="flex items-baseline gap-2 py-0.5">
      <span className="text-xs font-medium text-fg-muted">{formatStageEventLabel(event.stage)}</span>
      <time className="text-[10px] text-fg-muted/80" dateTime={event.created_at}>
        {formatRelativeTime(event.created_at)}
      </time>
    </div>
  );
}
