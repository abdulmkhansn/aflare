"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";

import { setFlareCommentSocialReaction } from "@/app/(app)/actions/flare-comment-reactions";
import { toggleFlareCommentHelpful } from "@/app/(app)/actions/helpful-marks";
import {
  ActionRowError,
  ContentActionRow,
  HelpfulActionButton,
} from "@/components/content-action-row";
import { SocialReactionPicker, applyReactionPick } from "@/components/reactions/social-reaction-controls";
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
    <ContentActionRow nested>
      {helpfulError ? <ActionRowError message={helpfulError} /> : null}

      {showHelpfulControl ? (
        <HelpfulActionButton
          count={optimisticHelpfulCount}
          active={optimisticHelpfulMarked}
          disabled={isPending}
          onClick={toggleHelpful}
        />
      ) : showHelpfulCountOnly ? (
        <HelpfulActionButton count={helpfulCount} active={helpfulCount > 0} readOnly />
      ) : null}

      <SocialReactionPicker
        userReaction={optimistic.userReaction}
        reactionCounts={optimistic.reactionCounts}
        disabled={isPending}
        onPick={pickSocialReaction}
      />
    </ContentActionRow>
  );
}
