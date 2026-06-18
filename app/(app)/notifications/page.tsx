import type { Metadata } from "next";

import { markAllNotificationsRead } from "@/app/(app)/actions/notifications";
import { NotificationList } from "@/components/notifications/notification-list";
import { pageTitle } from "@/lib/app/brand";
import { getAllNotifications, getUnreadNotificationCount } from "@/lib/notifications/queries";
import {
  emptyStateClassName,
  pageTitleClassName,
  secondaryButtonClassName,
} from "@/lib/ui/classes";
import { requireOnboarded } from "@/utils/auth/session";

export const metadata: Metadata = {
  title: pageTitle("Notifications"),
};

export default async function NotificationsPage() {
  const auth = await requireOnboarded();
  const [notifications, unreadCount] = await Promise.all([
    getAllNotifications(auth.userId),
    getUnreadNotificationCount(auth.userId),
  ]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={pageTitleClassName}>Notifications</h1>
          <p className="mt-1.5 text-sm text-fg-muted">
            Replies, follows, and other moments from people in your corner.
          </p>
        </div>

        {unreadCount > 0 ? (
          <form action={markAllNotificationsRead}>
            <button type="submit" className={secondaryButtonClassName}>
              Mark all read
            </button>
          </form>
        ) : null}
      </div>

      <div className="mt-6">
        {notifications.length === 0 ? (
          <div className={emptyStateClassName}>
            Nothing here yet. Post something, reply on a flare, or follow a few builders to get things moving.
          </div>
        ) : (
          <NotificationList notifications={notifications} />
        )}
      </div>
    </div>
  );
}
