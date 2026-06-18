"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";

import { setPostSocialReaction } from "@/app/(app)/actions/post-reactions";
import { togglePostHelpful } from "@/app/(app)/actions/helpful-marks";
import { BookmarkControl } from "@/components/bookmarks/bookmark-control";
import { ActionRowError, CommentCountAction, ContentActionRow, HelpfulActionButton } from "@/components/content-action-row";
import { PostRepostControl } from "@/components/post-repost-control";
import { SocialReactionPicker, applyReactionPick } from "@/components/reactions/social-reaction-controls";
import type { BookmarkTargetType } from "@/lib/bookmarks/types";
import type { PostReactionType, ReactionCounts } from "@/lib/reactions/types";
import { refreshInPlace } from "@/lib/ui/refresh-in-place";

type PostReactionBarProps = {
  postId: string;
  postAuthorId: string;
  currentUserId: string;
  helpfulCount: number;
  isHelpfulMarked: boolean;
  reactionCounts: ReactionCounts;
  userReaction: PostReactionType | null;
  redirectTo: string;
  hideHelpfulMark?: boolean;
  canRepost?: boolean;
  bookmarkTargetType?: BookmarkTargetType;
  bookmarkTargetId?: string;
  isBookmarked?: boolean;
  commentAction?: {
    label: string;
    onClick: () => void;
  };
};

type OptimisticState = {
  reactionCounts: ReactionCounts;
  userReaction: PostReactionType | null;
};

export function PostReactionBar({
  postId,
  postAuthorId,
  currentUserId,
  helpfulCount,
  isHelpfulMarked,
  reactionCounts,
  userReaction,
  redirectTo,
  hideHelpfulMark = false,
  canRepost = false,
  bookmarkTargetType,
  bookmarkTargetId,
  isBookmarked = false,
  commentAction,
}: PostReactionBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [helpfulError, setHelpfulError] = useState<string | null>(null);
  const [optimisticHelpfulMarked, setOptimisticHelpfulMarked] = useOptimistic(isHelpfulMarked);
  const [optimisticHelpfulCount, setOptimisticHelpfulCount] = useOptimistic(helpfulCount);

  const [optimistic, setOptimistic] = useOptimistic<OptimisticState, Partial<OptimisticState>>(
    {
      reactionCounts,
      userReaction,
    },
    (state, update) => ({
      reactionCounts: update.reactionCounts ?? state.reactionCounts,
      userReaction: update.userReaction !== undefined ? update.userReaction : state.userReaction,
    })
  );

  const isOwnPost = postAuthorId === currentUserId;
  const showHelpful = !hideHelpfulMark && !isOwnPost;

  function pickSocialReaction(reaction: PostReactionType) {
    const next = applyReactionPick(optimistic.reactionCounts, optimistic.userReaction, reaction);

    startTransition(async () => {
      setOptimistic({
        reactionCounts: next.counts,
        userReaction: next.userReaction,
      });

      const result = await setPostSocialReaction(postId, reaction);

      if (result.error) {
        refreshInPlace(router);
        return;
      }

      refreshInPlace(router);
    });
  }

  function toggleHelpful() {
    startTransition(async () => {
      setHelpfulError(null);
      const nextMarked = !optimisticHelpfulMarked;
      setOptimisticHelpfulMarked(nextMarked);
      setOptimisticHelpfulCount(
        nextMarked ? optimisticHelpfulCount + 1 : Math.max(0, optimisticHelpfulCount - 1)
      );

      const formData = new FormData();
      formData.set("post_id", postId);
      formData.set("is_marked", isHelpfulMarked ? "1" : "0");
      formData.set("redirect_to", redirectTo);

      const result = await togglePostHelpful(formData);

      if (!result.ok) {
        setHelpfulError(result.error);
        refreshInPlace(router);
        return;
      }

      refreshInPlace(router);
    });
  }

  return (
    <ContentActionRow>
      {helpfulError ? <ActionRowError message={helpfulError} /> : null}

      {showHelpful ? (
        <HelpfulActionButton
          count={optimisticHelpfulCount}
          active={optimisticHelpfulMarked}
          disabled={isPending}
          onClick={toggleHelpful}
        />
      ) : null}

      <SocialReactionPicker
        userReaction={optimistic.userReaction}
        reactionCounts={optimistic.reactionCounts}
        disabled={isPending}
        onPick={pickSocialReaction}
      />

      {canRepost ? (
        <PostRepostControl postId={postId} redirectTo={redirectTo} disabled={isPending} compact />
      ) : null}

      {bookmarkTargetType && bookmarkTargetId ? (
        <BookmarkControl
          targetType={bookmarkTargetType}
          targetId={bookmarkTargetId}
          isSaved={isBookmarked}
          disabled={isPending}
          showLabel={false}
        />
      ) : null}

      {commentAction ? (
        <CommentCountAction label={commentAction.label} onClick={commentAction.onClick} />
      ) : null}
    </ContentActionRow>
  );
}
