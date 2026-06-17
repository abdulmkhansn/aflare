"use client";

import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";

import { setPostSocialReaction } from "@/app/(app)/actions/post-reactions";
import { togglePostHelpful } from "@/app/(app)/actions/helpful-marks";
import { applyReactionPick, getReactionClusterMeta } from "@/lib/reactions/cluster";
import {
  SOCIAL_POST_REACTIONS,
  THIS_HELPED_REACTION,
} from "@/lib/reactions/constants";
import type { PostReactionType, ReactionCounts } from "@/lib/reactions/types";
import { focusRingClassName } from "@/lib/ui/classes";

type PostReactionBarProps = {
  postId: string;
  postAuthorId: string;
  currentUserId: string;
  helpfulCount: number;
  isHelpfulMarked: boolean;
  reactionCounts: ReactionCounts;
  userReaction: PostReactionType | null;
  redirectTo: string;
};

type OptimisticState = {
  reactionCounts: ReactionCounts;
  userReaction: PostReactionType | null;
};

function helpfulButtonClass(active: boolean) {
  return [
    "group/helpful relative inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
    focusRingClassName,
    active
      ? "border-teal/30 bg-teal/15 text-teal"
      : "border-border-subtle text-fg-muted hover:border-teal/30 hover:text-fg",
  ].join(" ");
}

function reactButtonClass(active: boolean) {
  return [
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
    focusRingClassName,
    active
      ? "border-fg/20 bg-[var(--hover-subtle)] text-fg"
      : "border-border-subtle text-fg-muted hover:border-fg/20 hover:text-fg",
  ].join(" ");
}

function ReactionTooltip({ label, groupName = "reaction" }: { label: string; groupName?: string }) {
  return (
    <span
      className={`pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-border-subtle bg-surface-card px-2 py-0.5 text-[10px] font-medium text-fg opacity-0 shadow-md transition-opacity group-hover/${groupName}:opacity-100`}
      role="tooltip"
    >
      {label}
    </span>
  );
}

type SocialReactionPickerProps = {
  userReaction: PostReactionType | null;
  disabled?: boolean;
  onPick: (reaction: PostReactionType) => void;
};

function SocialReactionPicker({ userReaction, disabled, onPick }: SocialReactionPickerProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentMeta = SOCIAL_POST_REACTIONS.find((item) => item.type === userReaction);

  useEffect(() => {
    if (!paletteOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setPaletteOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [paletteOpen]);

  function handleMainClick() {
    if (disabled) {
      return;
    }

    if (userReaction) {
      onPick(userReaction);
      return;
    }

    setPaletteOpen((open) => !open);
  }

  return (
    <div ref={containerRef} className="relative">
      {paletteOpen ? (
        <div
          role="menu"
          aria-label="Choose a reaction"
          className="absolute bottom-full left-0 z-20 mb-0 flex items-center gap-0.5 rounded-full border border-border-subtle bg-surface-card px-1.5 py-1 shadow-lg"
        >
          {SOCIAL_POST_REACTIONS.map(({ type, emoji, label }) => (
            <button
              key={type}
              type="button"
              role="menuitem"
              aria-label={label}
              disabled={disabled}
              onClick={() => {
                setPaletteOpen(false);
                onPick(type);
              }}
              className={`group/reaction relative rounded-full px-2 py-1 text-base transition-colors hover:bg-[var(--hover-subtle)] ${focusRingClassName}`}
            >
              <ReactionTooltip label={label} />
              <span aria-hidden="true">{emoji}</span>
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        aria-expanded={paletteOpen}
        aria-haspopup="menu"
        className={reactButtonClass(Boolean(userReaction))}
        onClick={handleMainClick}
      >
        {currentMeta ? (
          <>
            <span aria-hidden="true">{currentMeta.emoji}</span>
            <span>{currentMeta.label}</span>
          </>
        ) : (
          <span>React</span>
        )}
      </button>
    </div>
  );
}

function ReactionCluster({ counts }: { counts: ReactionCounts }) {
  const { total, emojis } = getReactionClusterMeta(counts);

  if (total === 0) {
    return null;
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-fg-muted"
      aria-label={`${total} reactions`}
    >
      <span className="inline-flex items-center -space-x-0.5" aria-hidden="true">
        {emojis.map((emoji, index) => (
          <span key={`${emoji}-${index}`} className="text-sm leading-none">
            {emoji}
          </span>
        ))}
      </span>
      <span>{total}</span>
    </span>
  );
}

export function PostReactionBar({
  postId,
  postAuthorId,
  currentUserId,
  helpfulCount,
  isHelpfulMarked,
  reactionCounts,
  userReaction,
  redirectTo,
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
        {!isOwnPost ? (
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
