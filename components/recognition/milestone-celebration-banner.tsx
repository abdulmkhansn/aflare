import { Suspense } from "react";

import { MilestoneCelebration } from "@/components/recognition/milestone-celebration";
import type { UserMilestone } from "@/lib/milestones/types";

type MilestoneCelebrationBannerProps = {
  pending: UserMilestone[];
};

export function MilestoneCelebrationBanner({ pending }: MilestoneCelebrationBannerProps) {
  return (
    <Suspense fallback={null}>
      <MilestoneCelebration pending={pending} />
    </Suspense>
  );
}
