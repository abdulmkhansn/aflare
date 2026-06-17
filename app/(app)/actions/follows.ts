"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function readUserId(formData: FormData) {
  return String(formData.get("user_id") ?? "").trim();
}

export async function followUser(formData: FormData) {
  const auth = await requireOnboarded();
  const userId = readUserId(formData);

  if (!userId) {
    redirect("/");
  }

  if (userId === auth.userId) {
    redirect(`/u/${auth.userId}`);
  }

  const supabase = await createClient();

  const { error } = await supabase.from("follows").insert({
    follower_id: auth.userId,
    following_id: userId,
  });

  if (error && error.code !== "23505") {
    redirect(`/u/${userId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath(`/u/${userId}`);
  redirect(`/u/${userId}`);
}

export async function unfollowUser(formData: FormData) {
  const auth = await requireOnboarded();
  const userId = readUserId(formData);

  if (!userId) {
    redirect("/");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", auth.userId)
    .eq("following_id", userId);

  if (error) {
    redirect(`/u/${userId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath(`/u/${userId}`);
  redirect(`/u/${userId}`);
}
