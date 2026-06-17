"use server";

import { revalidatePath } from "next/cache";

import { isMilestoneType } from "@/lib/milestones/types";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

export async function celebrateMilestone(milestone: string) {
  if (!isMilestoneType(milestone)) {
    return { error: "That moment was not found." };
  }

  const auth = await requireOnboarded();
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_milestones")
    .update({ celebrated: true })
    .eq("user_id", auth.userId)
    .eq("milestone", milestone)
    .eq("celebrated", false);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath(`/u/${auth.userId}`);

  return { ok: true as const };
}
