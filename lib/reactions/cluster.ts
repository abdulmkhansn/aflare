import { SOCIAL_POST_REACTIONS } from "@/lib/reactions/constants";
import type { PostReactionType, ReactionCounts } from "@/lib/reactions/types";

export type ReactionClusterMeta = {
  total: number;
  emojis: string[];
};

export function getReactionClusterMeta(counts: ReactionCounts): ReactionClusterMeta {
  const emojis: string[] = [];
  let total = 0;

  for (const { type, emoji } of SOCIAL_POST_REACTIONS) {
    const count = counts[type];

    if (count > 0) {
      emojis.push(emoji);
      total += count;
    }
  }

  return { total, emojis };
}

export function applyReactionPick(
  counts: ReactionCounts,
  current: PostReactionType | null,
  next: PostReactionType
): { counts: ReactionCounts; userReaction: PostReactionType | null } {
  const updated = { ...counts };

  if (current === next) {
    updated[next] = Math.max(0, updated[next] - 1);
    return { counts: updated, userReaction: null };
  }

  if (current) {
    updated[current] = Math.max(0, updated[current] - 1);
  }

  updated[next] += 1;
  return { counts: updated, userReaction: next };
}
