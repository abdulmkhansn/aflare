"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";

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
import { THIS_HELPED_REACTION } from "@/lib/reactions/constants";
import type { PostReactionType, ReactionCounts } from "@/lib/reactions/types";

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
}: PostReactionBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
        router.refresh();
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {!hideHelpfulMark && !isOwnPost ? (
          <form action={togglePostHelpful}>
            <input type="hidden" name="post_id" value={postId} />
            <input type="hidden" name="is_marked" value={isHelpfulMarked ? "1" : "0"} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <button
              type="submit"
              className={helpfulButtonClass(isHelpfulMarked)}
              disabled={isPending}
              aria-label={THIS_HELPED_REACTION.label}
              title={THIS_HELPED_REACTION.label}
            >
              <span aria-hidden="true">{THIS_HELPED_REACTION.emoji}</span>
              <span>{THIS_HELPED_REACTION.label}</span>
              <span aria-hidden="true">·</span>
              <span>{helpfulCount}</span>
              <ReactionTooltip label={THIS_HELPED_REACTION.label} groupName="helpful" />
            </button>
          </form>
        ) : null}

        {canRepost ? (
          <PostRepostControl postId={postId} redirectTo={redirectTo} disabled={isPending} />
        ) : null}

        <SocialReactionPicker
          userReaction={optimistic.userReaction}
          disabled={isPending}
          onPick={pickSocialReaction}
        />
      </div>

      <ReactionCluster counts={optimistic.reactionCounts} />
    </div>
  );
}
