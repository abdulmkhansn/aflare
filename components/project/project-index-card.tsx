import Link from "next/link";

import { ProjectStageProgress } from "@/components/app-shell/project-stage-progress";
import { ProjectOwnerMenu } from "@/components/project/project-owner-menu";
import type { UserProjectSummary } from "@/lib/projects/get-user-projects";
import { formatRelativeTime } from "@/lib/time/relative-time";
import { interactiveCardLinkClassName } from "@/lib/ui/classes";

type ProjectIndexCardProps = {
  project: UserProjectSummary;
};

export function ProjectIndexCard({ project }: ProjectIndexCardProps) {
  return (
    <div className={`relative ${interactiveCardLinkClassName}`}>
      <Link href={`/projects/${project.id}`} className="block pr-8">
        <h2 className="text-base font-medium text-fg">{project.name}</h2>
        <p className="mt-1 text-sm leading-relaxed text-fg-muted">{project.one_liner}</p>
        <div className="mt-3 max-w-xs">
          <ProjectStageProgress stage={project.stage} />
        </div>
        {project.lastActivityAt ? (
          <time className="mt-2 block text-xs text-fg-muted" dateTime={project.lastActivityAt}>
            Updated {formatRelativeTime(project.lastActivityAt)}
          </time>
        ) : (
          <p className="mt-2 text-xs text-fg-muted">No build-log posts yet</p>
        )}
      </Link>

      <ProjectOwnerMenu
        projectId={project.id}
        redirectTo="/projects"
        variant="compact"
        className="absolute top-3 right-3 z-10"
      />
    </div>
  );
}
