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
      href: "/flarespace",
      label: "Flarespace",
      icon: <IconFlarespace className="h-5 w-5" />,
      match: (path) => path.startsWith("/flarespace") || path.startsWith("/blockers"),
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
