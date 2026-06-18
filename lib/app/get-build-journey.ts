import { getProfileMilestones } from "@/lib/milestones/record-milestone";
import type { UserMilestone } from "@/lib/milestones/types";
import { createClient } from "@/utils/supabase/server";

import { getUserProjects, type UserProjectSummary } from "@/lib/projects/get-user-projects";

export type BuildJourneyProject = UserProjectSummary;

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

async function getBuildJourneyProjects(userId: string): Promise<BuildJourneyProject[]> {
  return getUserProjects(userId);
}

export async function getBuildJourneyData(userId: string): Promise<BuildJourneyData> {
  const supabase = await createClient();

  const [{ data: profile, error: profileError }, journeyProjects] = await Promise.all([
    supabase.from("profiles").select("reputation_score, created_at").eq("id", userId).maybeSingle(),
    getBuildJourneyProjects(userId),
  ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const allMoments = await getProfileMilestones(supabase, userId);
  const moments = [...allMoments]
    .sort((a, b) => new Date(b.reached_at).getTime() - new Date(a.reached_at).getTime())
    .slice(0, 3);

  return {
    projects: journeyProjects,
    moments,
    contribution: {
      helpedCount: profile?.reputation_score ?? 0,
      projectCount: journeyProjects.length,
      memberSince: profile?.created_at ?? new Date().toISOString(),
    },
  };
}
