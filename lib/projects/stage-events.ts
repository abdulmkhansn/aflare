import { PROJECT_STAGE_LABELS, isProjectStage } from "@/lib/projects/stages";

export type ProjectStageEvent = {
  id: string;
  project_id: string;
  stage: string;
  created_at: string;
};

export const PROJECT_STAGE_EVENT_SELECT = "id, project_id, stage, created_at";

export function formatStageEventLabel(stage: string): string {
  if (stage === "created") {
    return "Started";
  }

  if (isProjectStage(stage)) {
    if (stage === "building") {
      return "Moved to Building";
    }
    if (stage === "shipped") {
      return "Shipped";
    }
    if (stage === "idea") {
      return "Set to Idea";
    }
    if (stage === "parked") {
      return "Parked";
    }
    return PROJECT_STAGE_LABELS[stage];
  }

  return stage.replace(/_/g, " ");
}
