"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";

import { setPostSocialReaction } from "@/app/(app)/actions/post-reactions";
import { togglePostHelpful } from "@/app/(app)/actions/helpful-marks";
import {
  ReactionCluster,
  ReactionTooltip,
  SocialReactionPicker,
  applyReactionPick,
  helpfulButtonClass,
} from "@/components/reactions/social-reaction-controls";
import { PostRepostControl } from "@/components/post-repost-control";
import { BookmarkControl } from "@/components/bookmarks/bookmark-control";
import type { BookmarkTargetType } from "@/lib/bookmarks/types";
import { THIS_HELPED_REACTION } from "@/lib/reactions/constants";
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
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {!hideHelpfulMark && !isOwnPost ? (
          <div>
            {helpfulError ? (
              <p className="mb-1 text-xs text-red-600" role="alert">
                {helpfulError}
              </p>
            ) : null}
            <button
              type="button"
              onClick={toggleHelpful}
              className={helpfulButtonClass(optimisticHelpfulMarked)}
              disabled={isPending}
              aria-label={THIS_HELPED_REACTION.label}
              title={THIS_HELPED_REACTION.label}
            >
              <span aria-hidden="true">{THIS_HELPED_REACTION.emoji}</span>
              <span>{THIS_HELPED_REACTION.label}</span>
              <span aria-hidden="true">·</span>
              <span>{optimisticHelpfulCount}</span>
              <ReactionTooltip label={THIS_HELPED_REACTION.label} groupName="helpful" />
            </button>
          </div>
        ) : null}

        {canRepost ? (
          <PostRepostControl postId={postId} redirectTo={redirectTo} disabled={isPending} />
        ) : null}

        <SocialReactionPicker
          userReaction={optimistic.userReaction}
          reactionCounts={optimistic.reactionCounts}
          disabled={isPending}
          onPick={pickSocialReaction}
        />

        {bookmarkTargetType && bookmarkTargetId ? (
          <BookmarkControl
            targetType={bookmarkTargetType}
            targetId={bookmarkTargetId}
            isSaved={isBookmarked}
            disabled={isPending}
          />
        ) : null}
      </div>

      <ReactionCluster counts={optimistic.reactionCounts} />
    </div>
  );
}
