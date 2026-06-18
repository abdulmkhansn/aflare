import type { MilestoneType } from "@/lib/milestones/types";

export const MILESTONE_PROFILE_LABELS: Record<MilestoneType, string> = {
  first_project: "First project",
  first_ship: "First ship",
  first_flare: "First flare sent",
  first_help_given: "First time you helped someone",
  first_flare_reply: "First reply on a flare",
};

/** Compact labels for the build journey rail (warm, celebratory). */
export const MILESTONE_RAIL_LABELS: Record<MilestoneType, string> = {
  first_project: "First project started",
  first_ship: "🚀 First ship",
  first_flare: "First flare sent",
  first_help_given: "🙌 Helped someone for the first time",
  first_flare_reply: "First reply on a flare",
};

export const MILESTONE_CELEBRATION_COPY: Record<MilestoneType, string> = {
  first_project: "First project. You showed up with something real.",
  first_ship: "🚀 First ship. You put something into the world.",
  first_flare: "First flare sent — nice, that's the hard part.",
  first_help_given: "🙌 You helped someone get unstuck for the first time.",
  first_flare_reply: "First reply on a flare. You jumped in to help.",
};

export const FACET_LABELS = {
  helped: "Helped",
  building: "Building",
  showingUp: "Showing up",
} as const;

export const HELPED_EMPTY_COPY = "Here to help when you can";
export const BUILDING_EMPTY_COPY = "Just getting started.";
export const MOMENTS_EMPTY_COPY =
  "Your first moments will show up here as you build and help.";
export const BUILD_JOURNEY_PROJECTS_EMPTY_COPY =
  "Start your first project and keep a build log as you go.";
