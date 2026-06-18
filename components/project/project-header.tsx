import Link from "next/link";

import { AuthorLink } from "@/components/avatar";
import { ProjectOwnerMenu } from "@/components/project/project-owner-menu";
import { ProjectPostUpdateForm } from "@/components/project/project-post-update-form";
import { ProjectStageProgress } from "@/components/app-shell/project-stage-progress";
import type { ProjectPageProject } from "@/lib/projects/get-project-page-data";
import { formatTagLabel } from "@/lib/tags/format-tag-label";
import {
  cardClassName,
  focusRingClassName,
  pageTitleClassName,
  tagPillClassName,
  textLinkClassName,
} from "@/lib/ui/classes";

type ProjectHeaderProps = {
  project: ProjectPageProject;
  isOwner: boolean;
  posted?: boolean;
  postError?: string;
  statusMessage?: string | null;
};

export function ProjectHeader({
  project,
  isOwner,
  posted,
  postError,
  statusMessage,
}: ProjectHeaderProps) {
  return (
    <header className={cardClassName}>
      {statusMessage ? (
        <p className="mb-3 text-sm text-fg-muted" role="status">
          {statusMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className={pageTitleClassName}>{project.name}</h1>
          <p className="text-sm leading-relaxed text-fg-muted">{project.one_liner}</p>
        </div>

        {isOwner ? (
          <div className="flex shrink-0 items-center gap-1">
            <Link href={`/projects/${project.id}/edit`} className={textLinkClassName}>
              Edit project
            </Link>
            <ProjectOwnerMenu projectId={project.id} redirectTo="/projects" />
          </div>
        ) : null}
      </div>

      {project.owner ? (
        <div className="mt-4">
          <AuthorLink
            userId={project.owner.id}
            displayName={project.owner.display_name}
            avatarUrl={project.owner.avatar_url}
          />
        </div>
      ) : null}

      <div className="mt-4 max-w-xs">
        <ProjectStageProgress stage={project.stage} />
      </div>

      {project.abstract_description ? (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-fg">
          {project.abstract_description}
        </p>
      ) : null}

      {project.tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag.id} className={tagPillClassName}>
              {formatTagLabel(tag.label)}
            </li>
          ))}
        </ul>
      ) : null}

      {isOwner ? (
        <div className="mt-5 border-t border-border-subtle pt-4">
          <ProjectPostUpdateForm projectId={project.id} posted={posted} error={postError} />
        </div>
      ) : null}
    </header>
  );
}
