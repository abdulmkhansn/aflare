import type { createClient } from "@/utils/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** Reply authors count as helpers; the flare asker never does. */
export async function addFlareHelperIfEligible(
  supabase: SupabaseServerClient,
  flareId: string,
  userId: string,
  flareAuthorId: string
) {
  if (userId === flareAuthorId) {
    return;
  }

  const { error } = await supabase.from("flare_helpers").upsert(
    { flare_id: flareId, user_id: userId },
    { onConflict: "flare_id,user_id", ignoreDuplicates: true }
  );

  if (error && error.code !== "23505") {
    throw new Error(error.message);
  }
}
