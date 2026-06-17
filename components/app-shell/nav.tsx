"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import {
  IconFeed,
  IconFlarespace,
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
      href: "/flarespace",
      label: "Flarespace",
      icon: <IconFlarespace className="h-[18px] w-[18px]" />,
      match: (path) => path.startsWith("/flarespace") || path.startsWith("/blockers"),
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
