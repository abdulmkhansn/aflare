import { createClient } from "@/utils/supabase/server";

export type ProjectDeletePreview = {
  name: string;
  buildLogPostCount: number;
};

export async function getProjectDeletePreview(
  projectId: string,
  ownerId: string
): Promise<ProjectDeletePreview | null> {
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("name, owner_id")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError || !project || project.owner_id !== ownerId) {
    return null;
  }

  const { count, error: countError } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (countError) {
    throw new Error(countError.message);
  }

  return {
    name: project.name,
    buildLogPostCount: count ?? 0,
  };
}
