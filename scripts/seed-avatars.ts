const DICEBEAR_STYLE = "thumbs";

export function diceBearAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/svg?seed=${encodeURIComponent(seed)}`;
}

/** Abstract placeholder images — no real people, no branded UI. */
export const SEED_PLACEHOLDER_IMAGES = {
  dashboard: "https://picsum.photos/seed/aflare-ui-dashboard/1200/675",
  wireframe: "https://picsum.photos/seed/aflare-ui-wireframe/1200/675",
  terminal: "https://picsum.photos/seed/aflare-terminal/1200/675",
  sketch: "https://picsum.photos/seed/aflare-sketch/1200/675",
  articleCover: "https://picsum.photos/seed/aflare-article/1600/900",
} as const;
