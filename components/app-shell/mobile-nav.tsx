"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buildMobileNavItems } from "@/lib/app/nav-items";
import { focusRingClassName } from "@/lib/ui/classes";

type MobileNavProps = {
  userId: string;
  unreadMessageCount?: number;
};

export function MobileNav({ userId, unreadMessageCount = 0 }: MobileNavProps) {
  const pathname = usePathname();
  const mobileItems = buildMobileNavItems(userId);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface-rail pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Mobile"
    >
      <ul className="grid grid-cols-4">
        {mobileItems.map((item) => {
          const isActive = item.match(pathname);
          const badge = item.label === "Messages" ? unreadMessageCount : 0;

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
                  {badge > 0 ? (
                    <span className="absolute -top-1 -right-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[9px] font-medium text-warmwhite">
                      {badge > 9 ? "9+" : badge}
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
