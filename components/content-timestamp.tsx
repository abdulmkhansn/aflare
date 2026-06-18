import { formatRelativeTime } from "@/lib/time/relative-time";

type ContentTimestampProps = {
  createdAt: string;
  editedAt?: string | null;
  className?: string;
};

export function ContentTimestamp({
  createdAt,
  editedAt,
  className = "text-xs text-fg-muted",
}: ContentTimestampProps) {
  return (
    <span className={className}>
      <time dateTime={createdAt}>{formatRelativeTime(createdAt)}</time>
      {editedAt ? <span aria-label="Edited"> · edited</span> : null}
    </span>
  );
}
