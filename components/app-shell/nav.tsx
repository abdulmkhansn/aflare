"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import {
  IconBlockers,
  IconFeed,
  IconMessages,
  IconPlus,
  IconProfile,
} from "@/components/app-shell/icons";
import { focusRingClassName } from "@/lib/ui/classes";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  match: (pathname: string) => boolean;
  badge?: number;
};

function navItemClassName(isActive: boolean) {
  return [
    "flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    focusRingClassName,
    isActive
      ? "bg-[var(--nav-active-bg)] text-ember"
      : "text-fg-muted hover:bg-[var(--hover-subtle)] hover:text-fg",
  ].join(" ");
}

type LeftRailNavProps = {
  userId: string;
  unreadMessageCount?: number;
};

export function LeftRailNav({ userId, unreadMessageCount = 0 }: LeftRailNavProps) {
  const pathname = usePathname();
  const profileHref = `/u/${userId}`;

  const navItems: NavItem[] = [
    {
      href: "/",
      label: "Feed",
      icon: <IconFeed className="h-[18px] w-[18px]" />,
      match: (path) => path === "/",
    },
    {
      href: "/messages",
      label: "Messages",
      icon: <IconMessages className="h-[18px] w-[18px]" />,
      match: (path) => path.startsWith("/messages"),
      badge: unreadMessageCount,
    },
    {
      href: "/blockers",
      label: "Blockers",
      icon: <IconBlockers className="h-[18px] w-[18px]" />,
      match: (path) => path.startsWith("/blockers"),
    },
    {
      href: "/profile",
      label: "Profile",
      icon: <IconProfile className="h-[18px] w-[18px]" />,
      match: (path) => path.startsWith("/u/"),
    },
  ];

  return (
    <nav className="space-y-1" aria-label="Main">
      {navItems.map((item) => {
        const href = item.label === "Profile" ? profileHref : item.href;
        const isActive = item.match(pathname);

        return (
          <Link key={item.label} href={href} className={navItemClassName(isActive)}>
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.badge && item.badge > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1.5 text-[11px] font-medium text-warmwhite">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}

      <Link
        href="/projects/new"
        className={`mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-md bg-ember px-3 py-2.5 text-sm font-medium text-warmwhite transition-opacity hover:opacity-90 ${focusRingClassName}`}
      >
        <IconPlus className="h-[18px] w-[18px]" />
        New project
      </Link>
    </nav>
  );
}

type MobileNavProps = {
  userId: string;
  unreadMessageCount?: number;
};

export function MobileNav({ userId, unreadMessageCount = 0 }: MobileNavProps) {
  const pathname = usePathname();
  const profileHref = `/u/${userId}`;

  const mobileItems: NavItem[] = [
    {
      href: "/",
      label: "Feed",
      icon: <IconFeed className="h-5 w-5" />,
      match: (path) => path === "/",
    },
    {
      href: "/messages",
      label: "Messages",
      icon: <IconMessages className="h-5 w-5" />,
      match: (path) => path.startsWith("/messages"),
      badge: unreadMessageCount,
    },
    {
      href: "/blockers",
      label: "Blockers",
      icon: <IconBlockers className="h-5 w-5" />,
      match: (path) => path.startsWith("/blockers"),
    },
    {
      href: profileHref,
      label: "Profile",
      icon: <IconProfile className="h-5 w-5" />,
      match: (path) => path.startsWith("/u/"),
    },
    {
      href: "/projects/new",
      label: "New",
      icon: <IconPlus className="h-5 w-5" />,
      match: (path) => path.startsWith("/projects/new"),
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface-rail pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Mobile"
    >
      <ul className="grid grid-cols-5">
        {mobileItems.map((item) => {
          const isActive = item.match(pathname);

          return (
            <li key={item.label} className="relative">
              <Link
                href={item.href}
                className={[
                  "flex cursor-pointer flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium",
                  focusRingClassName,
                  isActive ? "text-ember" : "text-fg-muted",
                ].join(" ")}
              >
                <span className="relative">
                  {item.icon}
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1 -right-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[9px] font-medium text-warmwhite">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  ) : null}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
