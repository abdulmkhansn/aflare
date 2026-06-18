"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { inlineError, inlineOk, type InlineActionResult } from "@/lib/actions/inline-result";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function readUserId(formData: FormData) {
  return String(formData.get("user_id") ?? "").trim();
}

function readRedirectTo(formData: FormData) {
  return String(formData.get("redirect_to") ?? "").trim();
}

function revalidateFollowPaths(userId: string, redirectTo?: string) {
  revalidatePath("/");
  revalidatePath(`/u/${userId}`);

  if (redirectTo?.startsWith("/u/")) {
    revalidatePath(redirectTo);
  }
}

async function mutateFollow(
  formData: FormData,
  mode: "follow" | "unfollow"
): Promise<InlineActionResult> {
  const auth = await requireOnboarded();
  const userId = readUserId(formData);
  const redirectTo = readRedirectTo(formData);

  if (!userId) {
    return inlineError("Missing user.");
  }

  if (mode === "follow" && userId === auth.userId) {
    return inlineError("You cannot follow yourself.");
  }

  const supabase = await createClient();

  const { error } =
    mode === "follow"
      ? await supabase.from("follows").insert({
          follower_id: auth.userId,
          following_id: userId,
        })
      : await supabase
          .from("follows")
          .delete()
          .eq("follower_id", auth.userId)
          .eq("following_id", userId);

  if (error && !(mode === "follow" && error.code === "23505")) {
    return inlineError(error.message);
  }

  revalidateFollowPaths(userId, redirectTo);

  if (redirectTo) {
    redirect(redirectTo);
  }

  return inlineOk();
}

export async function followUser(formData: FormData): Promise<void> {
  await mutateFollow(formData, "follow");
}

export async function unfollowUser(formData: FormData): Promise<void> {
  await mutateFollow(formData, "unfollow");
}

export async function followUserInline(formData: FormData): Promise<InlineActionResult> {
  return mutateFollow(formData, "follow");
}

export async function unfollowUserInline(formData: FormData): Promise<InlineActionResult> {
  return mutateFollow(formData, "unfollow");
}
