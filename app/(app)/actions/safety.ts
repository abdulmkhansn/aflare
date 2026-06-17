"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function readTrimmed(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readUserId(formData: FormData) {
  return readTrimmed(formData, "user_id");
}

function readRedirectTo(formData: FormData) {
  return readTrimmed(formData, "redirect_to");
}

export async function blockUser(formData: FormData) {
  const auth = await requireOnboarded();
  const userId = readUserId(formData);
  const redirectTo = readRedirectTo(formData) || `/u/${userId}`;

  if (!userId || userId === auth.userId) {
    redirect(redirectTo);
  }

  const supabase = await createClient();

  const { error } = await supabase.from("blocks").insert({
    blocker_id: auth.userId,
    blocked_id: userId,
  });

  if (error && error.code !== "23505") {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/messages");
  revalidatePath(`/u/${userId}`);
  redirect(`${redirectTo}?blocked=1`);
}

export async function unblockUser(formData: FormData) {
  const auth = await requireOnboarded();
  const userId = readUserId(formData);
  const redirectTo = readRedirectTo(formData) || `/u/${userId}`;

  if (!userId) {
    redirect(redirectTo);
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", auth.userId)
    .eq("blocked_id", userId);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/messages");
  revalidatePath(`/u/${userId}`);
  redirect(`${redirectTo}?unblocked=1`);
}

export async function reportUser(formData: FormData) {
  const auth = await requireOnboarded();
  const userId = readUserId(formData);
  const redirectTo = readRedirectTo(formData) || `/u/${userId}`;
  const reason = readTrimmed(formData, "reason") || null;

  if (!userId || userId === auth.userId) {
    redirect(redirectTo);
  }

  const supabase = await createClient();

  const { error } = await supabase.from("reports").insert({
    reporter_id: auth.userId,
    reported_id: userId,
    reason,
  });

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`${redirectTo}?reported=1`);
}
