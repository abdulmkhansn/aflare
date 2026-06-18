"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isProjectStage, type ProjectStage } from "@/lib/projects/stages";
import { getProjectDeletePreview } from "@/lib/projects/get-project-delete-preview";
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
  revalidatePath("/projects");
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
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/u/${auth.userId}`);
  redirect(celebratePath);
}

function projectDeleteErrorRedirect(redirectTo: string, message: string): never {
  const separator = redirectTo.includes("?") ? "&" : "?";
  redirect(`${redirectTo}${separator}error=${encodeURIComponent(message)}`);
}

export async function fetchProjectDeletePreview(projectId: string) {
  const auth = await requireOnboarded();

  if (!projectId) {
    return { error: "That project was not found." } as const;
  }

  try {
    const preview = await getProjectDeletePreview(projectId, auth.userId);

    if (!preview) {
      return { error: "That project was not found." } as const;
    }

    return { preview } as const;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not load project details.",
    } as const;
  }
}

export async function deleteProject(formData: FormData) {
  const auth = await requireOnboarded();
  const projectId = readTrimmed(formData, "project_id");
  const redirectTo = readTrimmed(formData, "redirect_to") || "/projects";

  if (!projectId) {
    projectDeleteErrorRedirect(redirectTo, "That project was not found.");
  }

  const supabase = await createClient();

  const { data: project, error: loadError } = await supabase
    .from("projects")
    .select("id, owner_id")
    .eq("id", projectId)
    .maybeSingle();

  if (loadError || !project) {
    projectDeleteErrorRedirect(redirectTo, "That project was not found.");
  }

  if (project.owner_id !== auth.userId) {
    projectDeleteErrorRedirect(redirectTo, "You can only delete your own projects.");
  }

  const { error: deleteError } = await supabase.from("projects").delete().eq("id", projectId);

  if (deleteError) {
    projectDeleteErrorRedirect(redirectTo, deleteError.message);
  }

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/flarespace");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/u/${auth.userId}`);

  redirect("/projects?deleted=1");
}
