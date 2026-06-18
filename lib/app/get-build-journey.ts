import { getProfileMilestones } from "@/lib/milestones/record-milestone";
import type { UserMilestone } from "@/lib/milestones/types";
import { createClient } from "@/utils/supabase/server";

export type BuildJourneyProject = {
  id: string;
  name: string;
  stage: string;
  lastActivityAt: string | null;
};

export type BuildJourneyContribution = {
  helpedCount: number;
  projectCount: number;
  memberSince: string;
};

export type BuildJourneyData = {
  projects: BuildJourneyProject[];
  moments: UserMilestone[];
  contribution: BuildJourneyContribution;
};

async function getLatestPostTimesByProject(
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

export async function getBuildJourneyData(userId: string): Promise<BuildJourneyData> {
  const supabase = await createClient();

  const [{ data: projects, error: projectsError }, { data: profile, error: profileError }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, name, stage")
        .eq("owner_id", userId)
        .order("name"),
      supabase.from("profiles").select("reputation_score, created_at").eq("id", userId).maybeSingle(),
    ]);

  if (projectsError) {
    throw new Error(projectsError.message);
  }

  if (profileError) {
    throw new Error(profileError.message);
  }

  const projectRows = projects ?? [];
  const latestPosts = await getLatestPostTimesByProject(projectRows.map((project) => project.id));

  const journeyProjects: BuildJourneyProject[] = projectRows.map((project) => ({
    id: project.id,
    name: project.name,
    stage: project.stage,
    lastActivityAt: latestPosts.get(project.id) ?? null,
  }));

  const allMoments = await getProfileMilestones(supabase, userId);
  const moments = [...allMoments]
    .sort((a, b) => new Date(b.reached_at).getTime() - new Date(a.reached_at).getTime())
    .slice(0, 3);

  return {
    projects: journeyProjects,
    moments,
    contribution: {
      helpedCount: profile?.reputation_score ?? 0,
      projectCount: projectRows.length,
      memberSince: profile?.created_at ?? new Date().toISOString(),
    },
  };
}
