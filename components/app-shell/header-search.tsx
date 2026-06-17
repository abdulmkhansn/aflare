"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { IconSearch } from "@/components/app-shell/icons";
import { formatTagLabel } from "@/lib/tags/format-tag-label";
import type { QuickSearchResults } from "@/lib/search/run-quick-search";
import { focusRingClassName, headerSearchClassName } from "@/lib/ui/classes";

const EMPTY_RESULTS: QuickSearchResults = {
  builders: [],
  projects: [],
  tags: [],
};

export function HeaderSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = pathname === "/search" ? (searchParams.get("q") ?? "") : "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<QuickSearchResults>(EMPTY_RESULTS);
  const [hasResults, setHasResults] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults(EMPTY_RESULTS);
      setHasResults(false);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);

        if (!response.ok) {
          setResults(EMPTY_RESULTS);
          setHasResults(false);
          setOpen(true);
          return;
        }

        const data = (await response.json()) as QuickSearchResults & { hasResults: boolean };
        setResults({
          builders: data.builders ?? [],
          projects: data.projects ?? [],
          tags: data.tags ?? [],
        });
        setHasResults(Boolean(data.hasResults));
        setOpen(true);
      } catch {
        setResults(EMPTY_RESULTS);
        setHasResults(false);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      return;
    }

    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function closeAndNavigate() {
    setOpen(false);
  }

  const showPanel = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="header-search" className="sr-only">
          Search builders, projects, and tags
        </label>
        <IconSearch
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-fg-muted"
          aria-hidden="true"
        />
        <input
          id="header-search"
          name="q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            if (query.trim()) {
              setOpen(true);
            }
          }}
          placeholder="Search builders, projects, tags…"
          className={`${headerSearchClassName} pl-9`}
          autoComplete="off"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="header-search-results"
        />
      </form>

      {showPanel ? (
        <div
          id="header-search-results"
          role="listbox"
          className="absolute top-full right-0 left-0 z-50 mt-1 max-h-[min(24rem,70vh)] overflow-y-auto rounded-lg border border-border-subtle bg-surface-card shadow-lg"
        >
          {loading ? (
            <p className="px-4 py-3 text-sm text-fg-muted">Searching…</p>
          ) : !hasResults ? (
            <p className="px-4 py-3 text-sm text-fg-muted">
              Nothing matched that search. Try a different word.
            </p>
          ) : (
            <div className="py-2">
              {results.builders.length > 0 ? (
                <section className="px-2">
                  <p className="px-2 py-1 text-xs font-medium text-fg-muted">Builders</p>
                  <ul>
                    {results.builders.map((builder) => (
                      <li key={builder.id}>
                        <Link
                          href={`/u/${builder.id}`}
                          onClick={closeAndNavigate}
                          className={`block cursor-pointer rounded-md px-2 py-2 text-sm text-fg hover:bg-[var(--hover-subtle)] ${focusRingClassName}`}
                          role="option"
                        >
                          {builder.displayName?.trim() || "Unknown builder"}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {results.projects.length > 0 ? (
                <section className="mt-1 px-2">
                  <p className="px-2 py-1 text-xs font-medium text-fg-muted">Projects</p>
                  <ul>
                    {results.projects.map((project) => (
                      <li key={project.id}>
                        <Link
                          href={`/projects/${project.id}`}
                          onClick={closeAndNavigate}
                          className={`block cursor-pointer rounded-md px-2 py-2 hover:bg-[var(--hover-subtle)] ${focusRingClassName}`}
                          role="option"
                        >
                          <span className="text-sm text-fg">{project.name}</span>
                          <span className="mt-0.5 block truncate text-xs text-fg-muted">
                            {project.oneLiner}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {results.tags.length > 0 ? (
                <section className="mt-1 px-2">
                  <p className="px-2 py-1 text-xs font-medium text-fg-muted">Tags</p>
                  <ul>
                    {results.tags.map((tag) => (
                      <li key={tag.id}>
                        <Link
                          href={`/blockers?tag=${tag.id}`}
                          onClick={closeAndNavigate}
                          className={`block cursor-pointer rounded-md px-2 py-2 text-sm text-fg hover:bg-[var(--hover-subtle)] ${focusRingClassName}`}
                          role="option"
                        >
                          {formatTagLabel(tag.label)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
