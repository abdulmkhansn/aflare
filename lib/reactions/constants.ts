import type { PostReactionType } from "@/lib/reactions/types";

export const THIS_HELPED_REACTION = {
  emoji: "🙌",
  label: "This helped",
} as const;

export const SOCIAL_POST_REACTIONS: {
  type: PostReactionType;
  emoji: string;
  label: string;
}[] = [
  { type: "respect", emoji: "👏", label: "Respect" },
  { type: "been_there", emoji: "🙌", label: "Been there" },
  { type: "keep_going", emoji: "🔥", label: "Keep going" },
  { type: "made_me_think", emoji: "💡", label: "Made me think" },
];

export function getSocialReactionMeta(type: PostReactionType) {
  return SOCIAL_POST_REACTIONS.find((item) => item.type === type) ?? SOCIAL_POST_REACTIONS[0];
}
