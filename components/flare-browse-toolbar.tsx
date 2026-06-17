"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import {
  FLARE_STATUS_FILTER_LABELS,
  FLARE_STATUS_FILTERS,
  FLARE_VIEW_LABELS,
  FLARE_VIEWS,
  type FlareStatusFilter,
  type FlareView,
} from "@/lib/flares/flare-filters";
import type { TagOption } from "@/lib/flares/flare-tag-labels";
import { formatTagLabel } from "@/lib/tags/format-tag-label";
import { focusRingClassName } from "@/lib/ui/classes";

type FlareBrowseToolbarProps = {
  tags: TagOption[];
  activeTagId: string | null;
  activeView: FlareView;
};

function buildHref(
  pathname: string,
  params: URLSearchParams,
  updates: Record<string, string | null>
) {
  const next = new URLSearchParams(params.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value === null) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }

  next.delete("sort");

  const query = next.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function compactPillClass(isActive: boolean) {
  return [
    "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs transition-colors",
    focusRingClassName,
    isActive
      ? "bg-ember text-warmwhite"
      : "border border-border-subtle text-fg-muted hover:border-fg/20 hover:text-fg",
  ].join(" ");
}

function tabClass(isActive: boolean) {
  return [
    "inline-flex items-center border-b-2 px-3 py-2 text-sm font-medium transition-colors",
    focusRingClassName,
    isActive
      ? "border-ember text-fg"
      : "border-transparent text-fg-muted hover:border-border-subtle hover:text-fg",
  ].join(" ");
}

export function FlareBrowseToolbar({ tags, activeTagId, activeView }: FlareBrowseToolbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") ?? "all") as FlareStatusFilter;

  return (
    <div className="space-y-3">
      <nav className="-mx-1 flex gap-1 border-b border-border-subtle" aria-label="Flare lists">
        {FLARE_VIEWS.map((view) => (
          <Link
            key={view}
            href={buildHref(pathname, searchParams, {
              view: view === "open" ? null : view,
            })}
            className={tabClass(activeView === view)}
          >
            {FLARE_VIEW_LABELS[view]}
          </Link>
        ))}
      </nav>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-fg-muted">
            Status
          </span>
          {FLARE_STATUS_FILTERS.map((option) => (
            <Link
              key={option}
              href={buildHref(pathname, searchParams, {
                status: option === "all" ? null : option,
              })}
              className={compactPillClass(status === option)}
            >
              {FLARE_STATUS_FILTER_LABELS[option]}
            </Link>
          ))}
        </div>

        {tags.length > 0 ? (
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
            <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
              Tag
            </span>
            <Link
              href={buildHref(pathname, searchParams, { tag: null })}
              className={compactPillClass(activeTagId === null)}
            >
              All
            </Link>
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={buildHref(pathname, searchParams, { tag: tag.id })}
                className={compactPillClass(activeTagId === tag.id)}
              >
                {formatTagLabel(tag.label)}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
