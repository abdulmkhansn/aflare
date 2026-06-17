import { emptyReactionCounts, type PostReactionsContext } from "@/lib/reactions/types";

export function getPostReactionBarProps(
  postId: string,
  postAuthorId: string,
  context: PostReactionsContext
) {
  return {
    postAuthorId,
    helpfulCount: context.helpfulCountsByPostId.get(postId) ?? 0,
    isHelpfulMarked: context.markedHelpfulPostIds.has(postId),
    reactionCounts: context.countsByPostId.get(postId) ?? emptyReactionCounts(),
    userReaction: context.userReactionByPostId.get(postId) ?? null,
  };
}
