"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isProjectStage, type ProjectStage } from "@/lib/projects/stages";
import { recordMilestone, withCelebrationParam } from "@/lib/milestones/record-milestone";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function readTrimmed(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function projectFormErrorRedirect(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

type ProjectFieldsResult =
  | { ok: false; error: string }
  | {
      ok: true;
      name: string;
      oneLiner: string;
      stage: ProjectStage;
      abstractDescription: string;
    };

function validateProjectFields(formData: FormData): ProjectFieldsResult {
  const name = readTrimmed(formData, "name");
  const oneLiner = readTrimmed(formData, "one_liner");
  const stageRaw = readTrimmed(formData, "stage") || "building";
  const abstractDescription = readTrimmed(formData, "abstract_description");

  if (!name) {
    return { ok: false, error: "Name your project." };
  }

  if (!oneLiner) {
    return { ok: false, error: "Add a one-line summary." };
  }

  if (!isProjectStage(stageRaw)) {
    return { ok: false, error: "Pick a valid stage." };
  }

  return {
    ok: true,
    name,
    oneLiner,
    stage: stageRaw,
    abstractDescription,
  };
}

export async function createProject(formData: FormData) {
  const auth = await requireOnboarded();
  const fields = validateProjectFields(formData);

  if (!fields.ok) {
    projectFormErrorRedirect("/projects/new", fields.error);
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      owner_id: auth.userId,
      name: fields.name,
      one_liner: fields.oneLiner,
      stage: fields.stage,
      abstract_description: fields.abstractDescription || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    projectFormErrorRedirect("/projects/new", error?.message ?? "Could not create project.");
  }

  const { isNew } = await recordMilestone(supabase, auth.userId, "first_project");

  revalidatePath("/");
  revalidatePath(`/u/${auth.userId}`);
  redirect(
    withCelebrationParam(`/projects/${data.id}?created=1`, isNew, "first_project")
  );
}

export async function updateProject(formData: FormData) {
  const auth = await requireOnboarded();
  const projectId = readTrimmed(formData, "project_id");
  const fields = validateProjectFields(formData);

  if (!projectId) {
    projectFormErrorRedirect("/projects/new", "Project id is missing.");
  }

  if (!fields.ok) {
    projectFormErrorRedirect(`/projects/${projectId}/edit`, fields.error);
  }

  const supabase = await createClient();

  const { data: project, error: loadError } = await supabase
    .from("projects")
    .select("owner_id, stage")
    .eq("id", projectId)
    .maybeSingle();

  if (loadError || !project) {
    projectFormErrorRedirect(`/projects/${projectId}/edit`, "That project was not found.");
  }

  if (project.owner_id !== auth.userId) {
    projectFormErrorRedirect(`/projects/${projectId}`, "You can only edit your own projects.");
  }

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      name: fields.name,
      one_liner: fields.oneLiner,
      stage: fields.stage,
      abstract_description: fields.abstractDescription || null,
    })
    .eq("id", projectId);

  if (updateError) {
    projectFormErrorRedirect(`/projects/${projectId}/edit`, updateError.message);
  }

  let celebratePath = `/projects/${projectId}?updated=1`;

  if (fields.stage === "shipped" && project.stage !== "shipped") {
    const { isNew } = await recordMilestone(supabase, auth.userId, "first_ship");
    celebratePath = withCelebrationParam(celebratePath, isNew, "first_ship");
  }

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/u/${auth.userId}`);
  redirect(celebratePath);
}
