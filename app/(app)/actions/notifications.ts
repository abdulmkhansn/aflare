"use server";

import { revalidatePath } from "next/cache";

import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function revalidateNotificationPaths() {
  revalidatePath("/", "layout");
  revalidatePath("/notifications");
}

export async function markNotificationRead(notificationId: string) {
  const auth = await requireOnboarded();

  if (!notificationId) {
    return;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", auth.userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateNotificationPaths();
}

export async function markAllNotificationsRead() {
  const auth = await requireOnboarded();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", auth.userId)
    .eq("read", false);

  if (error) {
    throw new Error(error.message);
  }

  revalidateNotificationPaths();
}
