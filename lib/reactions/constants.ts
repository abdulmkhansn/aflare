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
  { type: "shipped", emoji: "🚀", label: "Shipped it!" },
  { type: "been_there", emoji: "💜", label: "Been there" },
  { type: "respect", emoji: "🤝", label: "Respect" },
  { type: "curious", emoji: "👀", label: "Curious" },
];
