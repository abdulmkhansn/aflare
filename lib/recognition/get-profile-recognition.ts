import { createClient } from "@/utils/supabase/server";

import { getProfileMilestones } from "@/lib/milestones/record-milestone";
import type { UserMilestone } from "@/lib/milestones/types";

export type ContributionFacets = {
  helped: string;
  building: string;
  showingUp: string;
};

export type ProfileRecognition = {
  facets: ContributionFacets;
  moments: UserMilestone[];
};

function formatMemberSince(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatHelpedCopy(reputationScore: number): string {
  if (reputationScore <= 0) {
    return "Here to help when you can";
  }

  if (reputationScore === 1) {
    return "Helped 1 builder";
  }

  return `Helped ${reputationScore} builders`;
}

function formatBuildingCopy(projectCount: number, shippedCount: number): string {
  if (projectCount <= 0) {
    return "Just getting started.";
  }

  const projectLabel = projectCount === 1 ? "1 project" : `${projectCount} projects`;

  if (shippedCount <= 0) {
    return projectLabel;
  }

  const shippedLabel = shippedCount === 1 ? "1 shipped" : `${shippedCount} shipped`;
  return `${projectLabel}, ${shippedLabel}`;
}

function formatShowingUpCopy(createdAt: string, activityCount: number): string {
  const since = formatMemberSince(createdAt);
  const base = `Building here since ${since}`;

  if (activityCount <= 0) {
    return base;
  }

  const activityLabel = activityCount === 1 ? "1 post shared" : `${activityCount} posts shared`;
  return `${base} · ${activityLabel}`;
}

export async function getProfileRecognition(userId: string): Promise<ProfileRecognition> {
  const supabase = await createClient();

  const [
    { data: profile, error: profileError },
    { count: projectCount, error: projectsError },
    { count: shippedProjectCount, error: shippedProjectsError },
    { count: shippedPostCount, error: shippedPostsError },
    { count: activityCount, error: activityError },
    moments,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("reputation_score, created_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId)
      .eq("stage", "shipped"),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", userId)
      .eq("type", "shipped"),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", userId),
    getProfileMilestones(supabase, userId),
  ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (projectsError) {
    throw new Error(projectsError.message);
  }

  if (shippedProjectsError) {
    throw new Error(shippedProjectsError.message);
  }

  if (shippedPostsError) {
    throw new Error(shippedPostsError.message);
  }

  if (activityError) {
    throw new Error(activityError.message);
  }

  const reputationScore = profile?.reputation_score ?? 0;
  const createdAt = profile?.created_at ?? new Date().toISOString();
  const projects = projectCount ?? 0;
  const shipped = Math.max(shippedProjectCount ?? 0, shippedPostCount ?? 0);

  return {
    facets: {
      helped: formatHelpedCopy(reputationScore),
      building: formatBuildingCopy(projects, shipped),
      showingUp: formatShowingUpCopy(createdAt, activityCount ?? 0),
    },
    moments,
  };
}
