import type { ReactNode } from "react";

import { AppFooter } from "@/components/app-shell/app-footer";
import { AppHeader } from "@/components/app-shell/app-header";
import { LeftRail } from "@/components/app-shell/left-rail";
import { MobileNav } from "@/components/app-shell/nav";
import { RightRail } from "@/components/app-shell/right-rail";
import type { ShellSidebarData, ShellUser } from "@/lib/app/get-shell-data";

type AppShellProps = {
  user: ShellUser;
  sidebar: ShellSidebarData;
  unreadMessageCount?: number;
  children: ReactNode;
};

export function AppShell({ user, sidebar, unreadMessageCount = 0, children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-page">
      <AppHeader
        userId={user.id}
        avatarUrl={user.avatarUrl}
        displayName={user.displayName}
      />

      <div className="mx-auto flex w-full max-w-[1280px] justify-center gap-0 xl:gap-8">
        <LeftRail user={user} unreadMessageCount={unreadMessageCount} />

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
