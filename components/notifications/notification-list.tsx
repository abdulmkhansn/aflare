"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { markNotificationRead } from "@/app/(app)/actions/notifications";
import { Avatar } from "@/components/avatar";
import type { AppNotification } from "@/lib/notifications/types";
import { formatRelativeTime } from "@/lib/time/relative-time";
import { focusRingClassName } from "@/lib/ui/classes";

type NotificationListProps = {
  notifications: AppNotification[];
  compact?: boolean;
  onNavigate?: () => void;
};

function notificationItemClassName(read: boolean, compact: boolean) {
  return [
    "flex cursor-pointer gap-3 rounded-md px-2 py-2.5 transition-colors",
    focusRingClassName,
    read ? "hover:bg-[var(--hover-subtle)]" : "bg-[var(--nav-active-bg)]/40 hover:bg-[var(--nav-active-bg)]/60",
    compact ? "text-left" : "",
  ].join(" ");
}

export function NotificationList({
  notifications,
  compact = false,
  onNavigate,
}: NotificationListProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  if (notifications.length === 0) {
    return (
      <p className="px-2 py-6 text-center text-sm text-fg-muted">
        Nothing new right now. When someone replies, follows, or helps, it shows up here.
      </p>
    );
  }

  return (
    <ul className={compact ? "max-h-[min(24rem,70vh)] overflow-y-auto py-1" : "space-y-1"}>
      {notifications.map((notification) => (
        <li key={notification.id}>
          <Link
            href={notification.href}
            className={notificationItemClassName(notification.read, compact)}
            onClick={(event) => {
              event.preventDefault();
              onNavigate?.();
              startTransition(async () => {
                if (!notification.read) {
                  await markNotificationRead(notification.id);
                }
                router.push(notification.href);
                router.refresh();
              });
            }}
          >
            <Avatar
              displayName={notification.actorName}
              avatarUrl={notification.actorAvatarUrl}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className={`text-sm leading-snug ${notification.read ? "text-fg-muted" : "text-fg"}`}>
                {notification.message}
              </p>
              <time
                className="mt-0.5 block text-xs text-fg-muted"
                dateTime={notification.createdAt}
              >
                {formatRelativeTime(notification.createdAt)}
              </time>
            </div>
            {!notification.read ? (
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ember" aria-hidden="true" />
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
