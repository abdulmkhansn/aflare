import { Suspense } from "react";

import { HeaderSearch } from "@/components/app-shell/header-search";
import { NotificationsBell } from "@/components/app-shell/notifications-bell";
import { TopNav } from "@/components/app-shell/top-nav";
import { UserMenu } from "@/components/app-shell/user-menu";
import { AflareWordmark } from "@/components/aflare-wordmark";
import { ThemeToggle } from "@/components/theme-toggle";
import type { AppNotification } from "@/lib/notifications/types";

type AppHeaderProps = {
  userId: string;
  avatarUrl: string | null;
  displayName: string | null;
  unreadMessageCount?: number;
  recentNotifications: AppNotification[];
  unreadNotificationCount: number;
};

function HeaderActions({
  userId,
  displayName,
  avatarUrl,
  recentNotifications,
  unreadNotificationCount,
}: Pick<
  AppHeaderProps,
  "userId" | "displayName" | "avatarUrl" | "recentNotifications" | "unreadNotificationCount"
>) {
  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      <NotificationsBell
        notifications={recentNotifications}
        unreadCount={unreadNotificationCount}
      />
      <ThemeToggle />
      <UserMenu userId={userId} displayName={displayName} avatarUrl={avatarUrl} />
    </div>
  );
}

export function AppHeader({
  userId,
  avatarUrl,
  displayName,
  unreadMessageCount = 0,
  recentNotifications,
  unreadNotificationCount,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-border-subtle bg-surface-header shadow-[var(--shadow-header)]">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
        <div className="hidden h-14 items-center md:flex">
          <div className="flex shrink-0 items-center gap-8 lg:gap-12">
            <AflareWordmark href="/" variant="app" className="shrink-0" />
            <TopNav userId={userId} unreadMessageCount={unreadMessageCount} />
          </div>

          <div className="mx-5 min-w-0 flex-1 lg:mx-10 lg:max-w-lg">
            <Suspense
              fallback={
                <div className="h-9 w-full rounded-md border border-[var(--border-input)] bg-surface-input shadow-[var(--elevation-input)]" />
              }
            >
              <HeaderSearch />
            </Suspense>
          </div>

          <HeaderActions
            userId={userId}
            displayName={displayName}
            avatarUrl={avatarUrl}
            recentNotifications={recentNotifications}
            unreadNotificationCount={unreadNotificationCount}
          />
        </div>

        <div className="flex flex-col gap-3 py-3 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <AflareWordmark href="/" variant="app" className="shrink-0" />
            <HeaderActions
              userId={userId}
              displayName={displayName}
              avatarUrl={avatarUrl}
              recentNotifications={recentNotifications}
              unreadNotificationCount={unreadNotificationCount}
            />
          </div>
          <Suspense
            fallback={
              <div className="h-9 w-full rounded-md border border-[var(--border-input)] bg-surface-input shadow-[var(--elevation-input)]" />
            }
          >
            <HeaderSearch />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
