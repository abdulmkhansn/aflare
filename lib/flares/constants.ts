import type { FlareStatus } from "@/lib/flares/types";

export const FLARE_STATUS_LABELS: Record<FlareStatus, string> = {
  open: "Open",
  being_helped: "Being helped",
  resolved: "Resolved",
};

export const FLARE_COMPOSE_PLACEHOLDER =
  "What are you stuck on? Describe it and people will help.";

export const FLARE_COMPOSE_HINT =
  "Helps to include: what you're trying to do, what's happening, what you've tried";

export const FLARE_SEND_EXPLAINER =
  "Stuck on something? Describe it and people will help.";

export const FLARE_TRIED_NUDGE =
  "Adding what you've tried helps people jump in faster.";
