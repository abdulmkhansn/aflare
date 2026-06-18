export const PLATFORM_NAME = "Aflare";

export const TAGLINE = "Build out loud. Together.";

export const DESCRIPTOR =
  "Whatever you're building and however you started, you're in the right room. People here help. They don't judge.";

export function pageTitle(suffix: string): string {
  return `${suffix} · ${PLATFORM_NAME}`;
}
