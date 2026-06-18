import type { FeedPost } from "@/lib/feed/types";
import { resolveFeedPostRelations } from "@/lib/feed/types";
import type { FlareListItem, FlareRow } from "@/lib/flares/types";

import { parseStructuredFields, type PostStructuredFields } from "./structured-fields";

export function isBoostMarker(fields: PostStructuredFields): boolean {
  return fields.boost === true;
}

export function isBoostPost(
  post: Pick<FeedPost, "boosted_flare_id" | "structured_fields">
): boolean {
  if (post.boosted_flare_id) {
    return true;
  }

  return isBoostMarker(parseStructuredFields(post.structured_fields));
}

export function resolveBoostedFlare(post: FeedPost): FlareListItem | null {
  if (!post.boosted_flare) {
    return null;
  }

  return Array.isArray(post.boosted_flare) ? post.boosted_flare[0] : post.boosted_flare;
}

export function isBoostedFlareUnavailable(post: FeedPost): boolean {
  return isBoostPost(post) && !resolveBoostedFlare(post);
}

export function buildBoostStructuredFields(): PostStructuredFields {
  return { boost: true };
}

export function boostHeaderLabel(displayName: string | null | undefined): string {
  const name = displayName?.trim() || "Someone";
  return `${name} thinks someone here might help`;
}

export function canBoostFlare(
  flare: Pick<FlareRow, "author_id" | "status">,
  currentUserId: string | null | undefined
): boolean {
  if (!currentUserId) {
    return false;
  }

  if (flare.author_id === currentUserId) {
    return false;
  }

  return flare.status !== "resolved";
}

export function resolveBoostQuoteAuthor(post: FeedPost) {
  return resolveFeedPostRelations(post).profile;
}
