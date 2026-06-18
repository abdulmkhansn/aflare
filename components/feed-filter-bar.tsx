"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import {
  FEED_FILTER_LABELS,
  FEED_FILTERS,
  type FeedFilter,
  parseFeedFilter,
} from "@/lib/feed/feed-filters";
import { focusRingClassName } from "@/lib/ui/classes";

function chipClassName(isActive: boolean) {
  return [
    "inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
    focusRingClassName,
    isActive
      ? "bg-[var(--nav-active-bg)] text-ember shadow-[var(--elevation-input)]"
      : "border border-[var(--border-input)] bg-surface-card text-fg-muted shadow-[var(--elevation-input)] hover:bg-[var(--hover-subtle)] hover:text-fg",
  ].join(" ");
}

function buildFilterHref(pathname: string, searchParams: URLSearchParams, filter: FeedFilter) {
  const params = new URLSearchParams(searchParams.toString());

  if (filter === "all") {
    params.delete("filter");
  } else {
    params.set("filter", filter);
  }

  params.delete("limit");

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function FeedFilterBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeFilter = parseFeedFilter(searchParams.get("filter") ?? undefined);

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      role="tablist"
      aria-label="Feed filters"
    >
      {FEED_FILTERS.map((filter) => {
        const isActive = activeFilter === filter;
        const href = buildFilterHref(pathname, searchParams, filter);

        return (
          <Link
            key={filter}
            href={href}
            role="tab"
            aria-selected={isActive}
            className={chipClassName(isActive)}
          >
            {FEED_FILTER_LABELS[filter]}
          </Link>
        );
      })}
    </div>
  );
}
