import Link from "next/link";
import { Suspense } from "react";

import { Avatar } from "@/components/avatar";
import { HeaderSearch } from "@/components/app-shell/header-search";
import { AflareWordmark } from "@/components/aflare-wordmark";
import { ThemeToggle } from "@/components/theme-toggle";

type AppHeaderProps = {
  userId: string;
  avatarUrl: string | null;
  displayName: string | null;
};

export function AppHeader({ userId, avatarUrl, displayName }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-border-subtle bg-surface-header">
      <div className="hidden h-14 grid-cols-[minmax(0,1fr)_minmax(0,28rem)_minmax(0,1fr)] items-center gap-4 px-6 lg:px-8 md:grid">
        <div className="flex items-center justify-start">
          <AflareWordmark href="/" variant="app" className="shrink-0" />
        </div>

        <div className="flex min-w-0 justify-center px-2">
          <Suspense
            fallback={
              <div className="h-9 w-full max-w-md rounded-md border border-border-subtle bg-surface-input" />
            }
          >
            <HeaderSearch />
          </Suspense>
        </div>

        <div className="flex items-center justify-end gap-2">
          <ThemeToggle />
          <Link
            href={`/u/${userId}`}
            className="inline-flex cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-header"
            aria-label={displayName?.trim() ? `${displayName.trim()} profile` : "Your profile"}
          >
            <Avatar displayName={displayName} avatarUrl={avatarUrl} size="sm" />
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <AflareWordmark href="/" variant="app" className="shrink-0" />
          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle />
            <Link
              href={`/u/${userId}`}
              className="inline-flex cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-header"
              aria-label={displayName?.trim() ? `${displayName.trim()} profile` : "Your profile"}
            >
              <Avatar displayName={displayName} avatarUrl={avatarUrl} size="sm" />
            </Link>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="h-9 w-full rounded-md border border-border-subtle bg-surface-input" />
          }
        >
          <HeaderSearch />
        </Suspense>
      </div>
    </header>
  );
}
