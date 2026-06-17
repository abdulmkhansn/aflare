"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuth } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

const PROJECT_STAGES = ["idea", "building", "shipped", "parked"] as const;

type ProjectStage = (typeof PROJECT_STAGES)[number];

function onboardingErrorRedirect(step: number, message: string): never {
  redirect(`/onboarding?step=${step}&error=${encodeURIComponent(message)}`);
}

function readTrimmed(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function isProjectStage(value: string): value is ProjectStage {
  return PROJECT_STAGES.includes(value as ProjectStage);
}

export async function saveProfileAndProject(formData: FormData) {
  const auth = await requireAuth();

  if (auth.projectCount > 0) {
    redirect("/onboarding?step=2");
  }

  const displayName = readTrimmed(formData, "display_name");
  const bio = readTrimmed(formData, "bio");
  const projectName = readTrimmed(formData, "project_name");
  const oneLiner = readTrimmed(formData, "one_liner");
  const stageRaw = readTrimmed(formData, "stage") || "building";
  const abstractDescription = readTrimmed(formData, "abstract_description");

  if (!displayName) {
    onboardingErrorRedirect(1, "Add a display name so people know who you are.");
  }

  if (!projectName) {
    onboardingErrorRedirect(1, "Name your project. You can change it later.");
  }

  if (!oneLiner) {
    onboardingErrorRedirect(1, "Add a one-line summary of what you are building.");
  }

  if (!isProjectStage(stageRaw)) {
    onboardingErrorRedirect(1, "Pick a stage for your project.");
  }

  const supabase = await createClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      bio: bio || null,
    })
    .eq("id", auth.userId);

  if (profileError) {
    onboardingErrorRedirect(1, profileError.message);
  }

  const { error: projectError } = await supabase.from("projects").insert({
    owner_id: auth.userId,
    name: projectName,
    one_liner: oneLiner,
    stage: stageRaw,
    abstract_description: abstractDescription || null,
  });

  if (projectError) {
    onboardingErrorRedirect(1, projectError.message);
  }

  revalidatePath("/", "layout");
  revalidatePath("/onboarding");
  redirect("/onboarding?step=2");
}

export async function saveProfileTags(formData: FormData) {
  const auth = await requireAuth();

  if (auth.projectCount === 0) {
    redirect("/onboarding?step=1");
  }

  const brings = formData.getAll("brings").map(String);
  const openTo = formData.getAll("open_to").map(String);
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("profile_tags")
    .delete()
    .eq("profile_id", auth.userId);

  if (deleteError) {
    onboardingErrorRedirect(2, deleteError.message);
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
    const { error: insertError } = await supabase.from("profile_tags").insert(rows);

    if (insertError) {
      onboardingErrorRedirect(2, insertError.message);
    }
  }

  revalidatePath("/onboarding");
  redirect("/onboarding?step=3");
}

export async function finishOnboarding() {
  await requireAuth();
  revalidatePath("/", "layout");
  redirect("/");
}
