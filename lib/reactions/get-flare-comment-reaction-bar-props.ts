import {
  emptyReactionCounts,
  type PostReactionType,
  type ReactionCounts,
} from "@/lib/reactions/types";

export type FlareCommentReactionsContext = {
  countsByCommentId: Map<string, ReactionCounts>;
  userReactionByCommentId: Map<string, PostReactionType | null>;
};

export function getFlareCommentReactionBarProps(
  commentId: string,
  context: FlareCommentReactionsContext
) {
  return {
    reactionCounts: context.countsByCommentId.get(commentId) ?? emptyReactionCounts(),
    userReaction: context.userReactionByCommentId.get(commentId) ?? null,
  };
}
