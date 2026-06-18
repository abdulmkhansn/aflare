import type { ReactNode } from "react";
import { Suspense } from "react";

import { AppFooter } from "@/components/app-shell/app-footer";
import { AppHeader } from "@/components/app-shell/app-header";
import { BuildJourneyRail } from "@/components/app-shell/build-journey-rail";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { RightRail } from "@/components/app-shell/right-rail";
import { TransientUrlToast } from "@/components/transient-url-toast";
import type { BuildJourneyData, ShellSidebarData, ShellUser } from "@/lib/app/get-shell-data";
import type { UserMilestone } from "@/lib/milestones/types";
import type { AppNotification } from "@/lib/notifications/types";

type AppShellProps = {
  user: ShellUser;
  sidebar: ShellSidebarData;
  buildJourney: BuildJourneyData;
  recentNotifications: AppNotification[];
  unreadNotificationCount: number;
  unreadMessageCount?: number;
  pendingMilestones?: UserMilestone[];
  children: ReactNode;
};

export function AppShell({
  user,
  sidebar,
  buildJourney,
  recentNotifications,
  unreadNotificationCount,
  unreadMessageCount = 0,
  pendingMilestones = [],
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-page">
      <AppHeader
        userId={user.id}
        avatarUrl={user.avatarUrl}
        displayName={user.displayName}
        unreadMessageCount={unreadMessageCount}
        recentNotifications={recentNotifications}
        unreadNotificationCount={unreadNotificationCount}
      />

      <Suspense fallback={null}>
        <TransientUrlToast pendingMilestones={pendingMilestones} />
      </Suspense>

      <div className="mx-auto flex w-full max-w-[1280px] justify-center gap-0 xl:gap-8">
        <BuildJourneyRail journey={buildJourney} />

        <main className="min-w-0 w-full max-w-[620px] flex-1 px-4 py-6 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-6 lg:px-0">
          {children}
          <AppFooter userId={user.id} />
        </main>

        <RightRail sidebar={sidebar} />
      </div>

      <MobileNav userId={user.id} unreadMessageCount={unreadMessageCount} />
    </div>
  );
}
