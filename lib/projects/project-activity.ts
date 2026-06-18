import { createClient } from "@/utils/supabase/server";

export async function getLatestPostTimesByProject(
  projectIds: string[]
): Promise<Map<string, string>> {
  if (projectIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("project_id, created_at")
    .in("project_id", projectIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const latestByProject = new Map<string, string>();

  for (const row of data ?? []) {
    if (row.project_id && !latestByProject.has(row.project_id)) {
      latestByProject.set(row.project_id, row.created_at);
    }
  }

  return latestByProject;
}
