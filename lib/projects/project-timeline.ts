import type { FeedPost } from "@/lib/feed/types";
import type { FlareStatus } from "@/lib/flares/types";

import type { ProjectStageEvent } from "./stage-events";

export type ProjectTimelineFlare = {
  id: string;
  title: string | null;
  body: string;
  status: FlareStatus;
  created_at: string;
  resolved_at: string | null;
};

export type ProjectTimelinePostEntry = {
  kind: "post";
  id: string;
  at: string;
  post: FeedPost;
};

export type ProjectTimelineStageEntry = {
  kind: "stage";
  id: string;
  at: string;
  event: ProjectStageEvent;
};

export type ProjectTimelineFlareEntry = {
  kind: "flare";
  id: string;
  at: string;
  flare: ProjectTimelineFlare;
};

export type ProjectTimelineEntry =
  | ProjectTimelinePostEntry
  | ProjectTimelineStageEntry
  | ProjectTimelineFlareEntry;

export function mergeProjectTimeline(
  posts: FeedPost[],
  stageEvents: ProjectStageEvent[],
  flares: ProjectTimelineFlare[]
): ProjectTimelineEntry[] {
  const entries: ProjectTimelineEntry[] = [
    ...posts.map((post) => ({
      kind: "post" as const,
      id: post.id,
      at: post.created_at,
      post,
    })),
    ...stageEvents.map((event) => ({
      kind: "stage" as const,
      id: event.id,
      at: event.created_at,
      event,
    })),
    ...flares.map((flare) => ({
      kind: "flare" as const,
      id: flare.id,
      at: flare.created_at,
      flare,
    })),
  ];

  return entries.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function flareTimelineTitle(flare: ProjectTimelineFlare): string {
  const title = flare.title?.trim();
  if (title) {
    return title;
  }

  const body = flare.body.trim();
  if (body.length <= 80) {
    return body;
  }

  return `${body.slice(0, 79).trimEnd()}…`;
}
