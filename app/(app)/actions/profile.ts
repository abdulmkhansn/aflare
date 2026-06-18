"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function readTrimmed(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function profileErrorRedirect(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function updateProfile(formData: FormData) {
  const auth = await requireOnboarded();
  const displayName = readTrimmed(formData, "display_name");
  const bio = readTrimmed(formData, "bio");
  const redirectTo = readTrimmed(formData, "redirect_to") || `/u/${auth.userId}`;

  if (!displayName) {
    profileErrorRedirect(redirectTo, "Add a name so people know who you are.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      bio: bio || null,
    })
    .eq("id", auth.userId);

  if (error) {
    profileErrorRedirect(redirectTo, error.message);
  }

  const brings = formData.getAll("brings").map(String);
  const openTo = formData.getAll("open_to").map(String);

  const { error: deleteTagsError } = await supabase
    .from("profile_tags")
    .delete()
    .eq("profile_id", auth.userId);

  if (deleteTagsError) {
    profileErrorRedirect(redirectTo, deleteTagsError.message);
  }

  const rows = [
    ...brings.map((tagId) => ({
      profile_id: auth.userId,
      tag_id: tagId,
      kind: "brings" as const,
    })),
    ...openTo.map((tagId) => ({
      profile_id: auth.userId,
      tag_id: tagId,
      kind: "open_to" as const,
    })),
  ];

  if (rows.length > 0) {
    const { error: insertTagsError } = await supabase.from("profile_tags").insert(rows);

    if (insertTagsError) {
      profileErrorRedirect(redirectTo, insertTagsError.message);
    }
  }

  revalidatePath("/", "layout");
  revalidatePath(`/u/${auth.userId}`);

  redirect(`${redirectTo}?saved=1`);
}

export async function saveAvatarUrl(formData: FormData) {
  const auth = await requireOnboarded();
  const avatarUrl = readTrimmed(formData, "avatar_url");
  const redirectTo = readTrimmed(formData, "redirect_to") || `/u/${auth.userId}/edit`;

  if (!avatarUrl) {
    profileErrorRedirect(redirectTo, "No photo was uploaded.");
  }

  const baseUrl = avatarUrl.split("?")[0];
  const versionedUrl = `${baseUrl}?v=${Date.now()}`;

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: versionedUrl })
    .eq("id", auth.userId);

  if (error) {
    profileErrorRedirect(redirectTo, error.message);
  }

  revalidatePath("/", "layout");
  revalidatePath(`/u/${auth.userId}`);

  redirect(`${redirectTo}?avatar=1`);
}
