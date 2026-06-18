import Link from "next/link";

import type { SavedItem } from "@/lib/bookmarks/types";
import { formatRelativeTime } from "@/lib/time/relative-time";
import { cardClassName, focusRingClassName } from "@/lib/ui/classes";

type SavedItemsListProps = {
  items: SavedItem[];
};

function kindLabel(kind: SavedItem["kind"]) {
  if (kind === "flare") {
    return "Flare";
  }

  if (kind === "article") {
    return "Article";
  }

  return "Post";
}

function kindBadgeClass(kind: SavedItem["kind"]) {
  if (kind === "flare") {
    return "bg-ember/15 text-ember";
  }

  if (kind === "article") {
    return "bg-teal/15 text-teal";
  }

  return "bg-[var(--badge-neutral-bg)] text-fg-muted";
}

export function SavedItemsList({ items }: SavedItemsListProps) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.bookmarkId}>
          <Link
            href={item.href}
            className={`block ${cardClassName} transition-colors hover:border-ember/30 ${focusRingClassName}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${kindBadgeClass(item.kind)}`}
                  >
                    {kindLabel(item.kind)}
                  </span>
                  <span className="text-xs text-fg-muted">{item.authorName}</span>
                </div>
                <h2 className="text-sm font-medium leading-snug text-fg">{item.title}</h2>
                {item.excerpt ? (
                  <p className="line-clamp-2 text-sm leading-relaxed text-fg-muted">{item.excerpt}</p>
                ) : null}
              </div>
              <time className="shrink-0 text-xs text-fg-muted" dateTime={item.savedAt}>
                Saved {formatRelativeTime(item.savedAt)}
              </time>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
