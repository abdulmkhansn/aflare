import Link from "next/link";

import { FollowButton } from "@/components/follow-button";
import type { ShellSidebarData } from "@/lib/app/get-shell-data";
import { focusRingClassName, sectionTitleClassName } from "@/lib/ui/classes";

type RightRailProps = {
  sidebar: ShellSidebarData;
};

export function RightRail({ sidebar }: RightRailProps) {
  return (
    <aside className="hidden w-[240px] shrink-0 self-start xl:block xl:w-[280px]">
      <div className="sticky top-14 space-y-6 px-3 py-6 lg:px-4">
        <section className="rounded-lg border border-border-subtle bg-surface-rail p-4">
          <h2 className={sectionTitleClassName}>Blockers you could help with</h2>

          {sidebar.blockers.length === 0 ? (
            <p className="mt-3 text-sm text-fg-muted">
              No open blockers right now. Check Blockers for new posts.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {sidebar.blockers.map((blocker) => {
                const author = blocker.authorName?.trim() || "Unknown builder";

                return (
                  <li key={blocker.id}>
                    <Link
                      href={`/projects/${blocker.projectId}`}
                      className={`block cursor-pointer rounded-md p-2 -mx-2 transition-colors hover:bg-[var(--hover-subtle)] ${focusRingClassName}`}
                    >
                      <p className="line-clamp-2 text-sm leading-snug text-fg">{blocker.excerpt}</p>
                      <p className="mt-1 text-xs text-fg-muted">
                        {author} · {blocker.projectName}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href="/blockers"
            className={`mt-3 inline-block cursor-pointer text-xs text-fg-muted hover:text-fg ${focusRingClassName}`}
          >
            View all blockers
          </Link>
        </section>

        <section className="rounded-lg border border-border-subtle bg-surface-rail p-4">
          <h2 className={sectionTitleClassName}>Builders to follow</h2>

          {sidebar.suggestedBuilders.length === 0 ? (
            <p className="mt-3 text-sm text-fg-muted">
              Add tags to your profile to see builders with overlapping interests.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {sidebar.suggestedBuilders.map((builder) => {
                const name = builder.displayName?.trim() || "Unknown builder";

                return (
                  <li key={builder.id} className="flex items-center justify-between gap-2">
                    <Link
                      href={`/u/${builder.id}`}
                      className={`min-w-0 truncate text-sm font-medium text-fg hover:underline cursor-pointer ${focusRingClassName}`}
                    >
                      {name}
                    </Link>
                    <FollowButton profileId={builder.id} isFollowing={false} compact />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </aside>
  );
}
