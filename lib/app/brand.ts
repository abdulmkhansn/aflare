export const PLATFORM_NAME = "Aflare";

export const TAGLINE = "Building out loud.";

export const DESCRIPTOR =
  "Keep a public build log, show where you're stuck, and find the people who help you reach the next stage.";

export function pageTitle(suffix: string): string {
  return `${suffix} · ${PLATFORM_NAME}`;
}
