"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { markAllNotificationsRead } from "@/app/(app)/actions/notifications";
import { IconBell } from "@/components/app-shell/icons";
import { NotificationList } from "@/components/notifications/notification-list";
import type { AppNotification } from "@/lib/notifications/types";
import { focusRingClassName } from "@/lib/ui/classes";

type NotificationsBellProps = {
  notifications: AppNotification[];
  unreadCount: number;
};

export function NotificationsBell({ notifications, unreadCount }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const [localUnread, setLocalUnread] = useState(unreadCount);
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocalUnread(unreadCount);
    setLocalNotifications(notifications);
  }, [unreadCount, notifications]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function handleToggle() {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen && localUnread > 0) {
      startTransition(async () => {
        await markAllNotificationsRead();
        setLocalUnread(0);
        setLocalNotifications((current) => current.map((item) => ({ ...item, read: true })));
        router.refresh();
      });
    }
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setLocalUnread(0);
      setLocalNotifications((current) => current.map((item) => ({ ...item, read: true })));
      router.refresh();
    });
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={`relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-[var(--hover-subtle)] hover:text-fg ${focusRingClassName}`}
        aria-label={
          localUnread > 0
            ? `Notifications, ${localUnread} unread`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="true"
      >
        <IconBell className="h-[18px] w-[18px]" />
        {localUnread > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ember px-1 text-[10px] font-medium text-warmwhite">
            {localUnread > 9 ? "9+" : localUnread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute top-full right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-border-subtle bg-surface-card shadow-lg">
          <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
            <h2 className="text-sm font-medium text-fg">Notifications</h2>
            {localUnread > 0 ? (
              <button
                type="button"
                disabled={isPending}
                onClick={handleMarkAllRead}
                className={`text-xs text-fg-muted hover:text-fg ${focusRingClassName}`}
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <NotificationList
            notifications={localNotifications}
            compact
            onNavigate={() => setOpen(false)}
          />

          <div className="border-t border-border-subtle px-4 py-2.5">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className={`block text-center text-xs font-medium text-fg-muted hover:text-fg ${focusRingClassName}`}
            >
              See all
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
