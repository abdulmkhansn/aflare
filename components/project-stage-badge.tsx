import {
  PROJECT_STAGE_LABELS,
  isProjectStage,
  projectStageBadgeClassName,
} from "@/lib/projects/stages";

type ProjectStageBadgeProps = {
  stage: string;
};

export function ProjectStageBadge({ stage }: ProjectStageBadgeProps) {
  const projectStage = isProjectStage(stage) ? stage : "building";
  const label = PROJECT_STAGE_LABELS[projectStage];

  return <span className={projectStageBadgeClassName(projectStage)}>{label}</span>;
}
