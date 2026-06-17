import type { FlareStatus } from "@/lib/flares/types";
import { FLARE_STATUS_LABELS } from "@/lib/flares/constants";

type FlareStatusBadgeProps = {
  status: FlareStatus;
};

function badgeClassName(status: FlareStatus) {
  switch (status) {
    case "open":
      return "border-ember/30 bg-ember/10 text-ember";
    case "being_helped":
      return "border-border-subtle bg-[var(--pill-neutral-bg)] text-fg";
    case "resolved":
      return "border-border-subtle bg-[var(--pill-neutral-bg)] text-fg-muted";
  }
}

export function FlareStatusBadge({ status }: FlareStatusBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClassName(status)}`}
    >
      {FLARE_STATUS_LABELS[status]}
    </span>
  );
}
