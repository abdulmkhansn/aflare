import type { SupabaseClient } from "@supabase/supabase-js";

import { recordMilestone } from "@/lib/milestones/record-milestone";

export async function recordHelpGivenMilestone(
  supabase: SupabaseClient,
  contentAuthorId: string
) {
  return recordMilestone(supabase, contentAuthorId, "first_help_given");
}
