"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buildAppNavItems } from "@/lib/app/nav-items";
import { focusRingClassName } from "@/lib/ui/classes";

type TopNavProps = {
  userId: string;
  unreadMessageCount?: number;
};

function topNavItemClassName(isActive: boolean) {
  return [
    "flex cursor-pointer flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors sm:flex-row sm:gap-2 sm:text-xs lg:px-3.5",
    focusRingClassName,
    isActive
      ? "bg-[var(--nav-active-bg)] text-ember"
      : "text-fg-muted hover:bg-[var(--hover-subtle)] hover:text-fg",
  ].join(" ");
}

export function TopNav({ userId, unreadMessageCount = 0 }: TopNavProps) {
  const pathname = usePathname();
  const navItems = buildAppNavItems(userId);

  return (
    <nav className="hidden items-center gap-1 lg:gap-1.5 md:flex" aria-label="Main">
      {navItems.map((item) => {
        const isActive = item.match(pathname);
        const badge = item.label === "Messages" ? unreadMessageCount : 0;

        return (
          <Link
            key={item.label}
            href={item.href}
            title={item.label}
            className={topNavItemClassName(isActive)}
          >
            <span className="relative">
              {item.icon}
              {badge > 0 ? (
                <span className="absolute -top-1.5 -right-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[9px] font-medium text-warmwhite">
                  {badge > 9 ? "9+" : badge}
                </span>
              ) : null}
            </span>
            <span className="hidden md:inline">{item.label}</span>
            <span className="md:hidden sr-only">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
