import { mapNotificationRow } from "@/lib/notifications/format";
import {
  NOTIFICATION_SELECT,
  type AppNotification,
  type NotificationRow,
} from "@/lib/notifications/types";
import { createClient } from "@/utils/supabase/server";

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function getRecentNotifications(
  userId: string,
  limit = 8
): Promise<AppNotification[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select(NOTIFICATION_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapNotificationRow(row as NotificationRow));
}

export async function getAllNotifications(userId: string): Promise<AppNotification[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select(NOTIFICATION_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapNotificationRow(row as NotificationRow));
}
