"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function readReturnTo(formData: FormData) {
  const value = String(formData.get("return_to") ?? "").trim();
  return value.startsWith("/") && !value.startsWith("//") ? value : "/settings";
}

export async function disconnectGitHubVerification(formData: FormData) {
  const auth = await requireOnboarded();
  const returnTo = readReturnTo(formData);
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      verified_builder: false,
      github_username: null,
      verified_at: null,
      github_public_repo_count: null,
      github_account_created_at: null,
    })
    .eq("id", auth.userId);

  if (error) {
    redirect(`${returnTo}?verify_error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath(`/u/${auth.userId}`);
  revalidatePath("/");

  redirect(`${returnTo}?disconnected=1`);
}
