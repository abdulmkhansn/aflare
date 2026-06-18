import { createClient } from "@/utils/supabase/server";

import { getLatestPostTimesByProject } from "./project-activity";

export type UserProjectSummary = {
  id: string;
  name: string;
  one_liner: string;
  stage: string;
  lastActivityAt: string | null;
};

export async function getUserProjects(userId: string): Promise<UserProjectSummary[]> {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, one_liner, stage")
    .eq("owner_id", userId)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  const projectRows = projects ?? [];
  const latestPosts = await getLatestPostTimesByProject(projectRows.map((project) => project.id));

  return projectRows.map((project) => ({
    id: project.id,
    name: project.name,
    one_liner: project.one_liner,
    stage: project.stage,
    lastActivityAt: latestPosts.get(project.id) ?? null,
  }));
}
