import type { Metadata } from "next";
import Link from "next/link";

import { IconPlus } from "@/components/app-shell/icons";
import { PageHeader } from "@/components/page-header";
import { ProjectIndexCard } from "@/components/project/project-index-card";
import { pageTitle } from "@/lib/app/brand";
import { BUILD_JOURNEY_PROJECTS_EMPTY_COPY } from "@/lib/milestones/constants";
import { getUserProjects } from "@/lib/projects/get-user-projects";
import {
  emptyStateClassName,
  errorTextClassName,
  focusRingClassName,
  primaryButtonClassName,
} from "@/lib/ui/classes";
import { requireOnboarded } from "@/utils/auth/session";

export const metadata: Metadata = {
  title: pageTitle("Your projects"),
};

type ProjectsIndexPageProps = {
  searchParams: Promise<{
    deleted?: string;
    error?: string;
  }>;
};

export default async function ProjectsIndexPage({ searchParams }: ProjectsIndexPageProps) {
  const auth = await requireOnboarded();
  const params = await searchParams;
  const projects = await getUserProjects(auth.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Your projects"
          description="Every build log in one place. Open a project to see the full journey."
        />
        <Link href="/projects/new" className={`${primaryButtonClassName} shrink-0 ${focusRingClassName}`}>
          <span className="inline-flex items-center gap-1.5">
            <IconPlus className="h-4 w-4" />
            New project
          </span>
        </Link>
      </div>

      {params.deleted === "1" ? (
        <p className="text-sm text-teal" role="status" aria-live="polite">
          Project deleted.
        </p>
      ) : null}

      {params.error ? (
        <p className={errorTextClassName} role="alert">
          {params.error}
        </p>
      ) : null}

      {projects.length === 0 ? (
        <div className={emptyStateClassName}>
          <p>{BUILD_JOURNEY_PROJECTS_EMPTY_COPY}</p>
          <Link
            href="/projects/new"
            className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-fg hover:underline ${focusRingClassName}`}
          >
            <IconPlus className="h-4 w-4" />
            Start a project
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectIndexCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
