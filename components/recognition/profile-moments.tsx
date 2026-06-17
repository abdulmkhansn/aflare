import { MILESTONE_PROFILE_LABELS, MOMENTS_EMPTY_COPY } from "@/lib/milestones/constants";
import type { UserMilestone } from "@/lib/milestones/types";
import { emptyStateClassName, sectionTitleClassName } from "@/lib/ui/classes";

type ProfileMomentsProps = {
  moments: UserMilestone[];
};

function formatMomentDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function ProfileMoments({ moments }: ProfileMomentsProps) {
  return (
    <section className="space-y-3">
      <h2 className={sectionTitleClassName}>Moments</h2>

      {moments.length === 0 ? (
        <div className={emptyStateClassName}>{MOMENTS_EMPTY_COPY}</div>
      ) : (
        <ul className="space-y-2">
          {moments.map((moment) => (
            <li
              key={moment.milestone}
              className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-lg border border-border-subtle bg-surface-card px-4 py-3"
            >
              <span className="text-sm text-fg">
                {MILESTONE_PROFILE_LABELS[moment.milestone]}
              </span>
              <time className="text-xs text-fg-muted" dateTime={moment.reached_at}>
                {formatMomentDate(moment.reached_at)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
