import Link from "next/link";

import { formatTagLabel } from "@/lib/tags/format-tag-label";
import { tagChipClassName } from "@/lib/flares/tag-chip-styles";
import { sectionTitleClassName } from "@/lib/ui/classes";

export type TagOption = {
  id: string;
  label: string;
};

type TagFilterChipsProps = {
  tags: TagOption[];
  activeTagId: string | null;
  basePath: string;
};

export function TagFilterChips({ tags, activeTagId, basePath }: TagFilterChipsProps) {
  return (
    <div className="space-y-2">
      <p className={sectionTitleClassName}>Filter by tag</p>
      <div className="flex flex-wrap gap-2">
        <Link href={basePath} className={tagChipClassName(activeTagId === null)}>
          All
        </Link>
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`${basePath}?tag=${tag.id}`}
            className={tagChipClassName(activeTagId === tag.id)}
          >
            {formatTagLabel(tag.label)}
          </Link>
        ))}
      </div>
    </div>
  );
}
