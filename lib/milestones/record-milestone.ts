import type { SupabaseClient } from "@supabase/supabase-js";

import type { MilestoneType, UserMilestone } from "@/lib/milestones/types";
import { createAdminClient } from "@/utils/supabase/admin";

export type RecordMilestoneResult = {
  isNew: boolean;
};

export async function recordMilestone(
  _supabase: SupabaseClient,
  userId: string,
  milestone: MilestoneType
): Promise<RecordMilestoneResult> {
  const admin = createAdminClient();

  if (!admin) {
    throw new Error("Milestone recording is not configured.");
  }

  const { error } = await admin.from("user_milestones").insert({
    user_id: userId,
    milestone,
    celebrated: false,
  });

  if (error) {
    if (error.code === "23505") {
      return { isNew: false };
    }

    throw new Error(error.message);
  }

  return { isNew: true };
}

export function withCelebrationParam(
  path: string,
  isNew: boolean,
  milestone: MilestoneType
): string {
  if (!isNew) {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}celebrate=${milestone}`;
}

export async function getUncelebratedMilestones(
  supabase: SupabaseClient,
  userId: string
): Promise<UserMilestone[]> {
  const { data, error } = await supabase
    .from("user_milestones")
    .select("user_id, milestone, reached_at, celebrated")
    .eq("user_id", userId)
    .eq("celebrated", false)
    .order("reached_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as UserMilestone[];
}

export async function getProfileMilestones(
  supabase: SupabaseClient,
  userId: string
): Promise<UserMilestone[]> {
  const { data, error } = await supabase
    .from("user_milestones")
    .select("user_id, milestone, reached_at, celebrated")
    .eq("user_id", userId)
    .order("reached_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as UserMilestone[];
}
