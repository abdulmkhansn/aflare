export const POST_REACTION_TYPES = ["shipped", "been_there", "respect", "curious"] as const;

export type PostReactionType = (typeof POST_REACTION_TYPES)[number];

export type ReactionCounts = Record<PostReactionType, number>;

export function emptyReactionCounts(): ReactionCounts {
  return {
    shipped: 0,
    been_there: 0,
    respect: 0,
    curious: 0,
  };
}

export type PostReactionsContext = {
  countsByPostId: Map<string, ReactionCounts>;
  userReactionByPostId: Map<string, PostReactionType | null>;
  markedHelpfulPostIds: Set<string>;
  helpfulCountsByPostId: Map<string, number>;
};
