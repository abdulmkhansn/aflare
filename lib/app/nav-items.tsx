import type { ReactNode } from "react";

import {
  IconFeed,
  IconFlarespace,
  IconMessages,
  IconProfile,
} from "@/components/app-shell/icons";

export type AppNavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  match: (pathname: string) => boolean;
};

export function buildAppNavItems(userId: string): AppNavItem[] {
  const profileHref = `/u/${userId}`;

  return [
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
    },
    {
      href: "/flarespace",
      label: "Flarespace",
      icon: <IconFlarespace className="h-[18px] w-[18px]" />,
      match: (path) => path.startsWith("/flarespace") || path.startsWith("/blockers"),
    },
    {
      href: profileHref,
      label: "Profile",
      icon: <IconProfile className="h-[18px] w-[18px]" />,
      match: (path) => path.startsWith("/u/") && !path.endsWith("/edit"),
    },
  ];
}

export function buildMobileNavItems(userId: string): AppNavItem[] {
  const profileHref = `/u/${userId}`;

  return [
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
      match: (path) => path.startsWith("/u/") && !path.endsWith("/edit"),
    },
  ];
}
