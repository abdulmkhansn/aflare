import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { formatTagLabel } from "@/lib/tags/format-tag-label";
import {
  emptyStateClassName,
  interactiveCardLinkClassName,
  sectionTitleClassName,
  tagPillClassName,
} from "@/lib/ui/classes";
import type { SearchResults } from "@/lib/search/run-search";

type SearchResultsViewProps = {
  query: string;
  results: SearchResults;
};

export function SearchResultsView({ query, results }: SearchResultsViewProps) {
  return (
    <div className="space-y-8">
      <PageHeader title="Search" description={`Results for "${query}"`} />

      {results.builders.length > 0 ? (
        <section className="space-y-3">
          <h2 className={sectionTitleClassName}>Builders</h2>
          <ul className="space-y-2">
            {results.builders.map((builder) => (
              <li key={builder.id}>
                <Link href={`/u/${builder.id}`} className={interactiveCardLinkClassName}>
                  <span className="text-base font-medium text-fg">
                    {builder.displayName?.trim() || "Unknown builder"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {results.projects.length > 0 ? (
        <section className="space-y-3">
          <h2 className={sectionTitleClassName}>Projects</h2>
          <ul className="space-y-2">
            {results.projects.map((project) => (
              <li key={project.id}>
                <Link href={`/projects/${project.id}`} className={interactiveCardLinkClassName}>
                  <span className="text-base font-medium text-fg">{project.name}</span>
                  <p className="mt-1 text-sm text-fg-muted">{project.oneLiner}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {results.tags.length > 0 ? (
        <section className="space-y-3">
          <h2 className={sectionTitleClassName}>Tags</h2>
          <ul className="space-y-4">
            {results.tags.map((tag) => (
              <li
                key={tag.id}
                className="rounded-lg border border-border-subtle bg-surface-card p-4"
              >
                <Link
                  href={`/blockers?tag=${tag.id}`}
                  className={`inline-flex ${tagPillClassName} hover:opacity-90`}
                >
                  {formatTagLabel(tag.label)}
                </Link>

                {tag.projects.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-fg-muted">Projects</p>
                    <ul className="mt-1.5 space-y-1">
                      {tag.projects.map((project) => (
                        <li key={project.id}>
                          <Link
                            href={`/projects/${project.id}`}
                            className="text-sm text-fg hover:underline"
                          >
                            {project.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {tag.profiles.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-fg-muted">Builders</p>
                    <ul className="mt-1.5 space-y-1">
                      {tag.profiles.map((profile) => (
                        <li key={profile.id}>
                          <Link
                            href={`/u/${profile.id}`}
                            className="text-sm text-fg hover:underline"
                          >
                            {profile.displayName?.trim() || "Unknown builder"}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
