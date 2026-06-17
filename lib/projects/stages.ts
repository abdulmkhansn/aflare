export const PROJECT_STAGES = ["idea", "building", "shipped", "parked"] as const;

export type ProjectStage = (typeof PROJECT_STAGES)[number];

export const PROJECT_STAGE_LABELS: Record<ProjectStage, string> = {
  idea: "Idea",
  building: "Building",
  shipped: "Shipped",
  parked: "Parked",
};

export function isProjectStage(value: string): value is ProjectStage {
  return PROJECT_STAGES.includes(value as ProjectStage);
}

export function projectStageBadgeClassName(_stage: ProjectStage): string {
  return "inline-flex items-center rounded-full bg-[var(--pill-neutral-bg)] px-2 py-0.5 text-xs font-medium text-fg";
}
