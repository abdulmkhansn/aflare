"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";

import { setFlareCommentSocialReaction } from "@/app/(app)/actions/flare-comment-reactions";
import { toggleFlareCommentHelpful } from "@/app/(app)/actions/helpful-marks";
import {
  ReactionCluster,
  ReactionTooltip,
  SocialReactionPicker,
  applyReactionPick,
  helpfulButtonClass,
} from "@/components/reactions/social-reaction-controls";
import { THIS_HELPED_REACTION } from "@/lib/reactions/constants";
import type { PostReactionType, ReactionCounts } from "@/lib/reactions/types";
import { refreshInPlace } from "@/lib/ui/refresh-in-place";

type FlareCommentReactionBarProps = {
  commentId: string;
  flareId: string;
  commentAuthorId: string;
  currentUserId: string;
  redirectTo: string;
  helpfulCount: number;
  isHelpfulMarked: boolean;
  canMarkHelpful: boolean;
  reactionCounts: ReactionCounts;
  userReaction: PostReactionType | null;
};

type OptimisticState = {
  reactionCounts: ReactionCounts;
  userReaction: PostReactionType | null;
};

export function FlareCommentReactionBar({
  commentId,
  flareId,
  commentAuthorId,
  currentUserId,
  redirectTo,
  helpfulCount,
  isHelpfulMarked,
  canMarkHelpful,
  reactionCounts,
  userReaction,
}: FlareCommentReactionBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [helpfulError, setHelpfulError] = useState<string | null>(null);
  const [optimisticHelpfulMarked, setOptimisticHelpfulMarked] = useOptimistic(isHelpfulMarked);
  const [optimisticHelpfulCount, setOptimisticHelpfulCount] = useOptimistic(helpfulCount);
  const isOwnComment = commentAuthorId === currentUserId;

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

  function pickSocialReaction(reaction: PostReactionType) {
    const next = applyReactionPick(optimistic.reactionCounts, optimistic.userReaction, reaction);

    startTransition(async () => {
      setOptimistic({
        reactionCounts: next.counts,
        userReaction: next.userReaction,
      });

      const result = await setFlareCommentSocialReaction(commentId, reaction);

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
      formData.set("comment_id", commentId);
      formData.set("flare_id", flareId);
      formData.set("is_marked", isHelpfulMarked ? "1" : "0");
      formData.set("redirect_to", redirectTo);

      const result = await toggleFlareCommentHelpful(formData);

      if (!result.ok) {
        setHelpfulError(result.error);
        refreshInPlace(router);
        return;
      }

      refreshInPlace(router);
    });
  }

  const showHelpfulControl = canMarkHelpful && !isOwnComment;
  const showHelpfulCountOnly = !showHelpfulControl && helpfulCount > 0;

  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {showHelpfulControl ? (
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
        ) : showHelpfulCountOnly ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-teal/30 bg-teal/15 px-2.5 py-1 text-xs font-medium text-teal">
            <span aria-hidden="true">{THIS_HELPED_REACTION.emoji}</span>
            <span>{THIS_HELPED_REACTION.label}</span>
            <span aria-hidden="true">·</span>
            <span>{helpfulCount}</span>
          </span>
        ) : null}

        <SocialReactionPicker
          userReaction={optimistic.userReaction}
          reactionCounts={optimistic.reactionCounts}
          disabled={isPending}
          onPick={pickSocialReaction}
        />
      </div>

      <ReactionCluster counts={optimistic.reactionCounts} />
    </div>
  );
}
