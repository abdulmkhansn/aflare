import { isProjectStage, PROJECT_STAGE_LABELS, type ProjectStage } from "@/lib/projects/stages";

const JOURNEY_STEPS: ProjectStage[] = ["idea", "building", "shipped"];

function journeyStepIndex(stage: string): number {
  if (!isProjectStage(stage)) {
    return 1;
  }

  if (stage === "shipped") {
    return 2;
  }

  if (stage === "building" || stage === "parked") {
    return 1;
  }

  return 0;
}

type ProjectStageProgressProps = {
  stage: string;
};

export function ProjectStageProgress({ stage }: ProjectStageProgressProps) {
  const currentIndex = journeyStepIndex(stage);
  const isParked = stage === "parked";

  return (
    <div className="mt-2">
      <div className="flex items-center gap-1" aria-hidden="true">
        {JOURNEY_STEPS.map((step, index) => {
          const isReached = index <= currentIndex;

          return (
            <div key={step} className="flex flex-1 items-center gap-1">
              <span
                className={[
                  "h-1.5 flex-1 rounded-full transition-colors",
                  isReached ? "bg-ember" : "bg-[var(--pill-neutral-bg)]",
                  isReached && index < currentIndex ? "opacity-60" : "",
                ].join(" ")}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between gap-1 text-[10px] leading-none text-fg-muted">
        {JOURNEY_STEPS.map((step, index) => {
          const isCurrent = index === currentIndex;

          return (
            <span
              key={step}
              className={isCurrent ? "font-medium text-ember" : undefined}
            >
              {PROJECT_STAGE_LABELS[step]}
            </span>
          );
        })}
      </div>
      {isParked ? (
        <p className="mt-1 text-[10px] text-fg-muted">{PROJECT_STAGE_LABELS.parked}</p>
      ) : null}
    </div>
  );
}
