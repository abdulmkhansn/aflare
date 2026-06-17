import Link from "next/link";

import { signOut } from "@/app/(app)/actions/auth";
import { Avatar } from "@/components/avatar";
import { IconSignOut, IconVerified } from "@/components/app-shell/icons";
import { LeftRailNav } from "@/components/app-shell/nav";
import type { ShellUser } from "@/lib/app/get-shell-data";
import { focusRingClassName } from "@/lib/ui/classes";

type LeftRailProps = {
  user: ShellUser;
  unreadMessageCount?: number;
};

export function LeftRail({ user, unreadMessageCount = 0 }: LeftRailProps) {
  const displayName = user.displayName?.trim() || "Your profile";

  return (
    <aside className="hidden w-[200px] shrink-0 self-start md:block lg:w-[220px]">
      <div className="sticky top-14 flex flex-col gap-6 px-3 py-6 lg:px-4">
        <LeftRailNav userId={user.id} unreadMessageCount={unreadMessageCount} />

        <div className="rounded-lg border border-border-subtle bg-surface-rail p-3">
          <div className="flex items-start gap-3">
            <Avatar displayName={user.displayName} avatarUrl={user.avatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <Link
                  href={`/u/${user.id}`}
                  className={`truncate text-sm font-medium text-fg hover:underline cursor-pointer ${focusRingClassName}`}
                >
                  {displayName}
                </Link>
                {user.verifiedBuilder ? (
                  <span className="shrink-0 text-teal" title="Verified builder">
                    <IconVerified />
                    <span className="sr-only">Verified builder</span>
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-fg-muted">
                Reputation <span className="font-medium text-teal">{user.reputationScore}</span>
              </p>
            </div>
          </div>

          <form action={signOut} className="mt-3 border-t border-border-subtle pt-3">
            <button
              type="submit"
              className={`inline-flex cursor-pointer items-center gap-1.5 text-xs text-fg-muted transition-colors hover:text-fg ${focusRingClassName}`}
            >
              <IconSignOut />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
