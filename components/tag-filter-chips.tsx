import Link from "next/link";

import { formatTagLabel } from "@/lib/tags/format-tag-label";
import { focusRingClassName, sectionTitleClassName } from "@/lib/ui/classes";

export type TagOption = {
  id: string;
  label: string;
};

type TagFilterChipsProps = {
  tags: TagOption[];
  activeTagId: string | null;
  basePath: string;
};

function chipClassName(isActive: boolean) {
  return [
    "inline-flex items-center rounded-full px-3 py-1 text-sm transition-colors cursor-pointer",
    focusRingClassName,
    isActive
      ? "bg-charcoal text-warmwhite"
      : "border border-border-subtle bg-surface-card text-fg hover:bg-[var(--hover-subtle)]",
  ].join(" ");
}

export function TagFilterChips({ tags, activeTagId, basePath }: TagFilterChipsProps) {
  return (
    <div className="space-y-2">
      <p className={sectionTitleClassName}>Filter by tag</p>
      <div className="flex flex-wrap gap-2">
        <Link href={basePath} className={chipClassName(activeTagId === null)}>
          All
        </Link>
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`${basePath}?tag=${tag.id}`}
            className={chipClassName(activeTagId === tag.id)}
          >
            {formatTagLabel(tag.label)}
          </Link>
        ))}
      </div>
    </div>
  );
}
