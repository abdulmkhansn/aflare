export const POST_REACTION_TYPES = [
  "respect",
  "been_there",
  "keep_going",
  "made_me_think",
] as const;

export type PostReactionType = (typeof POST_REACTION_TYPES)[number];

export type ReactionCounts = Record<PostReactionType, number>;

export function emptyReactionCounts(): ReactionCounts {
  return {
    respect: 0,
    been_there: 0,
    keep_going: 0,
    made_me_think: 0,
  };
}

/** Map legacy DB values until migration runs — ignored after SQL migration. */
export const LEGACY_REACTION_MAP: Record<string, PostReactionType | null> = {
  shipped: "keep_going",
  curious: "made_me_think",
  been_there: "been_there",
  respect: "respect",
  keep_going: "keep_going",
  made_me_think: "made_me_think",
};

export function normalizeReactionType(value: string): PostReactionType | null {
  if (POST_REACTION_TYPES.includes(value as PostReactionType)) {
    return value as PostReactionType;
  }

  return LEGACY_REACTION_MAP[value] ?? null;
}

export type PostReactionsContext = {
  countsByPostId: Map<string, ReactionCounts>;
  userReactionByPostId: Map<string, PostReactionType | null>;
  markedHelpfulPostIds: Set<string>;
  helpfulCountsByPostId: Map<string, number>;
};
