"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { celebrateMilestone } from "@/app/(app)/actions/milestones";
import { MILESTONE_CELEBRATION_COPY } from "@/lib/milestones/constants";
import { isMilestoneType, type MilestoneType, type UserMilestone } from "@/lib/milestones/types";
import { focusRingClassName } from "@/lib/ui/classes";

type MilestoneCelebrationProps = {
  pending: UserMilestone[];
};

export function MilestoneCelebration({ pending }: MilestoneCelebrationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [dismissed, setDismissed] = useState(false);

  const celebrateParam = searchParams.get("celebrate");
  const paramMilestone =
    celebrateParam && isMilestoneType(celebrateParam) ? celebrateParam : null;
  const pendingMilestone = pending[0]?.milestone ?? null;
  const activeMilestone: MilestoneType | null = paramMilestone ?? pendingMilestone;

  useEffect(() => {
    setDismissed(false);
  }, [activeMilestone]);

  if (!activeMilestone || dismissed) {
    return null;
  }

  function dismiss() {
    startTransition(async () => {
      await celebrateMilestone(activeMilestone!);
      setDismissed(true);

      if (paramMilestone) {
        const next = new URLSearchParams(searchParams.toString());
        next.delete("celebrate");
        const query = next.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div
      className="mb-6 rounded-lg border border-ember/25 bg-ember/10 px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-relaxed text-fg">{MILESTONE_CELEBRATION_COPY[activeMilestone]}</p>
        <button
          type="button"
          onClick={dismiss}
          disabled={isPending}
          className={`shrink-0 text-xs text-fg-muted hover:text-fg ${focusRingClassName}`}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
