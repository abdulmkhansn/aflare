import Link from "next/link";

import { IconPlus } from "@/components/app-shell/icons";
import { ProjectStageProgress } from "@/components/app-shell/project-stage-progress";
import type { BuildJourneyData } from "@/lib/app/get-build-journey";
import {
  BUILD_JOURNEY_PROJECTS_EMPTY_COPY,
  MILESTONE_RAIL_LABELS,
  MOMENTS_EMPTY_COPY,
} from "@/lib/milestones/constants";
import { formatRelativeTime } from "@/lib/time/relative-time";
import { focusRingClassName, panelClassName, sectionTitleClassName } from "@/lib/ui/classes";

type BuildJourneyRailProps = {
  journey: BuildJourneyData;
};

function formatMemberSince(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function ContributionLine({
  helpedCount,
  projectCount,
  memberSince,
}: BuildJourneyData["contribution"]) {
  const since = formatMemberSince(memberSince);
  const projectLabel = projectCount === 1 ? "1 project" : `${projectCount} projects`;

  return (
    <p className="text-xs leading-relaxed text-fg-muted">
      {helpedCount > 0 ? (
        <>
          <Link
            href="/flarespace?view=helping"
            className={`text-fg-muted hover:text-fg hover:underline ${focusRingClassName}`}
          >
            {helpedCount === 1 ? "Helped 1 builder" : `Helped ${helpedCount} builders`}
          </Link>
        </>
      ) : (
        <Link
          href="/flarespace"
          className={`text-fg-muted hover:text-fg hover:underline ${focusRingClassName}`}
        >
          Here to help when you can
        </Link>
      )}
      {projectCount > 0 ? (
        <>
          <span aria-hidden="true"> · </span>
          <span>{projectLabel}</span>
        </>
      ) : null}
      <span aria-hidden="true"> · </span>
      <span>here since {since}</span>
    </p>
  );
}

export function BuildJourneyRail({ journey }: BuildJourneyRailProps) {
  const { projects, moments, contribution } = journey;

  return (
    <aside className="hidden w-[200px] shrink-0 self-start md:block lg:w-[240px]">
      <div className="sticky top-14 space-y-5 px-3 py-6 lg:px-4">
        <section>
          <h2 className={sectionTitleClassName}>Your build journey</h2>

          {projects.length === 0 ? (
            <div className={`mt-3 p-3 ${panelClassName}`}>
              <p className="text-sm leading-relaxed text-fg-muted">
                {BUILD_JOURNEY_PROJECTS_EMPTY_COPY}
              </p>
              <Link
                href="/projects/new"
                className={`mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-fg hover:underline ${focusRingClassName}`}
              >
                <IconPlus className="h-4 w-4" />
                Start a project
              </Link>
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}`}
                    className={`block rounded-md border border-transparent px-2 py-2 transition-colors hover:border-border-subtle hover:bg-[var(--hover-subtle)] ${focusRingClassName}`}
                  >
                    <span className="block truncate text-sm font-medium text-fg">
                      {project.name}
                    </span>
                    <ProjectStageProgress stage={project.stage} />
                    {project.lastActivityAt ? (
                      <time
                        className="mt-1.5 block text-[10px] text-fg-muted"
                        dateTime={project.lastActivityAt}
                      >
                        Updated {formatRelativeTime(project.lastActivityAt)}
                      </time>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {projects.length > 0 ? (
            <Link
              href="/projects/new"
              className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted hover:text-fg ${focusRingClassName}`}
            >
              <IconPlus className="h-3.5 w-3.5" />
              New project
            </Link>
          ) : null}
        </section>

        <section>
          <h3 className={sectionTitleClassName}>Moments</h3>

          {moments.length === 0 ? (
            <p className="mt-2 text-xs leading-relaxed text-fg-muted">{MOMENTS_EMPTY_COPY}</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {moments.map((moment) => (
                <li
                  key={moment.milestone}
                  className="rounded-md border border-border-subtle bg-surface-card px-2.5 py-2 shadow-[var(--elevation-card)]"
                >
                  <p className="text-xs leading-snug text-fg">
                    {MILESTONE_RAIL_LABELS[moment.milestone]}
                  </p>
                  <time
                    className="mt-0.5 block text-[10px] text-fg-muted"
                    dateTime={moment.reached_at}
                  >
                    {formatRelativeTime(moment.reached_at)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <ContributionLine {...contribution} />
      </div>
    </aside>
  );
}
