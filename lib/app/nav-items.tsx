import type { ReactNode } from "react";

import {
  IconFeed,
  IconFlarespace,
  IconMessages,
} from "@/components/app-shell/icons";

export type AppNavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  match: (pathname: string) => boolean;
};

export function buildAppNavItems(_userId: string): AppNavItem[] {
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
  ];
}

export function buildMobileNavItems(userId: string): AppNavItem[] {
  return buildAppNavItems(userId);
}
