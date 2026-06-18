"use server";

import { redirect } from "next/navigation";

import { requireOnboarded } from "@/utils/auth/session";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function deleteAccount() {
  const auth = await requireOnboarded();
  const admin = createAdminClient();

  if (!admin) {
    redirect("/settings?error=Account%20deletion%20is%20unavailable%20right%20now.%20Try%20again%20later.");
  }

  const { error: anonymizeError } = await admin.rpc("anonymize_profile", {
    user_id: auth.userId,
  });

  if (anonymizeError) {
    redirect(
      `/settings?error=${encodeURIComponent(anonymizeError.message || "Could not delete your account. Try again.")}`
    );
  }

  const { error: deleteAuthError } = await admin.auth.admin.deleteUser(auth.userId);

  if (deleteAuthError) {
    redirect(
      `/settings?error=${encodeURIComponent(deleteAuthError.message || "Could not finish deleting your account. Try again.")}`
    );
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/login?deleted=1");
}
