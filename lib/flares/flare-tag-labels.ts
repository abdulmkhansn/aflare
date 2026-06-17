export const FLARE_TAG_LABELS = [
  "frontend",
  "backend",
  "database",
  "auth",
  "deployment",
  "design",
  "api",
  "mobile",
  "performance",
  "tooling",
] as const;

function normalizeTagLabel(label: string): string {
  return label.trim().toLowerCase().replace(/_/g, " ");
}

export function isFlareTagLabel(label: string): boolean {
  const normalized = normalizeTagLabel(label);
  return FLARE_TAG_LABELS.includes(normalized as (typeof FLARE_TAG_LABELS)[number]);
}

export type TagOption = {
  id: string;
  label: string;
};

export function filterFlareTags<T extends TagOption>(tags: T[]): T[] {
  const allowed = new Set<string>(FLARE_TAG_LABELS);

  return tags
    .filter((tag) => allowed.has(normalizeTagLabel(tag.label)))
    .sort(
      (a, b) =>
        FLARE_TAG_LABELS.indexOf(normalizeTagLabel(a.label) as (typeof FLARE_TAG_LABELS)[number]) -
        FLARE_TAG_LABELS.indexOf(normalizeTagLabel(b.label) as (typeof FLARE_TAG_LABELS)[number])
    );
}
