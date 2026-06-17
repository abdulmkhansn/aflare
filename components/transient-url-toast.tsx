"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

import { celebrateMilestone } from "@/app/(app)/actions/milestones";
import { TransientToast } from "@/components/transient-toast";
import { MILESTONE_CELEBRATION_COPY } from "@/lib/milestones/constants";
import { isMilestoneType } from "@/lib/milestones/types";
import type { UserMilestone } from "@/lib/milestones/types";
import { getToastMessage, isToastKey } from "@/lib/ui/toast-messages";

type TransientUrlToastProps = {
  pendingMilestones?: UserMilestone[];
};

export function TransientUrlToast({ pendingMilestones = [] }: TransientUrlToastProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const toastParam = searchParams.get("toast");
  const celebrateParam = searchParams.get("celebrate");

  const paramMilestone =
    celebrateParam && isMilestoneType(celebrateParam) ? celebrateParam : null;
  const pendingMilestone = pendingMilestones[0]?.milestone ?? null;
  const milestone = paramMilestone ?? pendingMilestone;
  const toastKey = toastParam && isToastKey(toastParam) ? toastParam : null;

  const message = milestone
    ? MILESTONE_CELEBRATION_COPY[milestone]
    : toastKey
      ? getToastMessage(toastKey)
      : null;

  const variant =
    milestone || toastKey === "flare_sent" ? "flare" : "default";

  const clearParams = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("toast");
    next.delete("celebrate");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleDismiss = useCallback(() => {
    if (milestone) {
      startTransition(async () => {
        await celebrateMilestone(milestone);
        clearParams();
        router.refresh();
      });
      return;
    }

    clearParams();
  }, [clearParams, milestone, router]);

  if (!message) {
    return null;
  }

  return (
    <TransientToast
      key={milestone ?? toastKey ?? message}
      message={message}
      variant={variant}
      onDismiss={handleDismiss}
    />
  );
}
