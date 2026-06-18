"use client";

import { useEffect, useRef, useState } from "react";

import { applyReactionPick, getReactionBreakdown } from "@/lib/reactions/cluster";
import { SOCIAL_POST_REACTIONS, getSocialReactionMeta } from "@/lib/reactions/constants";
import type { PostReactionType, ReactionCounts } from "@/lib/reactions/types";
import { focusRingClassName } from "@/lib/ui/classes";

export function helpfulButtonClass(active: boolean) {
  return [
    "group/helpful relative inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
    focusRingClassName,
    active
      ? "border-teal/30 bg-teal/15 text-teal"
      : "border-border-subtle text-fg-muted hover:border-teal/30 hover:text-fg",
  ].join(" ");
}

export function reactButtonClass(active: boolean) {
  return [
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
    focusRingClassName,
    active
      ? "border-ember/30 bg-ember/10 text-fg"
      : "border-border-subtle text-fg-muted hover:border-fg/20 hover:text-fg",
  ].join(" ");
}

export function ReactionTooltip({
  label,
  groupName = "reaction",
}: {
  label: string;
  groupName?: string;
}) {
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
  reactionCounts: ReactionCounts;
  disabled?: boolean;
  onPick: (reaction: PostReactionType) => void;
};

export function SocialReactionPicker({
  userReaction,
  reactionCounts,
  disabled,
  onPick,
}: SocialReactionPickerProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const currentMeta = userReaction ? getSocialReactionMeta(userReaction) : null;
  const activeCount = userReaction ? reactionCounts[userReaction] : 0;

  function clearCloseTimer() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setPaletteOpen(false), 120);
  }

  function openPalette() {
    if (disabled) {
      return;
    }

    clearCloseTimer();
    setPaletteOpen(true);
  }

  function handleTriggerClick() {
    if (disabled) {
      return;
    }

    clearCloseTimer();
    setPaletteOpen((open) => !open);
  }

  useEffect(() => {
    if (!paletteOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setPaletteOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPaletteOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [paletteOpen]);

  useEffect(() => () => clearCloseTimer(), []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={openPalette}
      onMouseLeave={scheduleClose}
    >
      {paletteOpen ? (
        <div
          role="menu"
          aria-label="Choose a reaction"
          className="absolute bottom-full left-0 z-30 mb-1 pb-1"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          <div className="flex items-end gap-0.5 rounded-full border border-border-subtle bg-surface-card px-2 py-2 shadow-[var(--elevation-card)]">
            {SOCIAL_POST_REACTIONS.map(({ type, emoji, label }) => {
              const selected = userReaction === type;

              return (
                <button
                  key={type}
                  type="button"
                  role="menuitem"
                  aria-label={label}
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => {
                    setPaletteOpen(false);
                    onPick(type);
                  }}
                  className={[
                    "group/reaction relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-xl transition-all duration-150",
                    focusRingClassName,
                    selected
                      ? "bg-ember/15 ring-1 ring-ember/30"
                      : "hover:scale-110 hover:bg-[var(--hover-subtle)] hover:-translate-y-0.5",
                  ].join(" ")}
                >
                  <span
                    className="pointer-events-none absolute -top-8 left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-md bg-charcoal px-2 py-1 text-[11px] font-medium text-warmwhite opacity-0 shadow-md transition-opacity group-hover/reaction:opacity-100"
                    role="tooltip"
                  >
                    {label}
                  </span>
                  <span aria-hidden="true">{emoji}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        aria-expanded={paletteOpen}
        aria-haspopup="menu"
        aria-label={currentMeta ? `${currentMeta.label}. Open reaction picker` : "React"}
        className={reactButtonClass(Boolean(userReaction))}
        onClick={handleTriggerClick}
      >
        {currentMeta ? (
          <>
            <span aria-hidden="true">{currentMeta.emoji}</span>
            {activeCount > 0 ? <span>{activeCount}</span> : null}
          </>
        ) : (
          <span>React</span>
        )}
      </button>
    </div>
  );
}

export function ReactionCluster({ counts }: { counts: ReactionCounts }) {
  const breakdown = getReactionBreakdown(counts);

  if (breakdown.length === 0) {
    return null;
  }

  const total = breakdown.reduce((sum, item) => sum + item.count, 0);

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-muted">
      {breakdown.map(({ type, emoji, label, count }) => (
        <span
          key={type}
          className="inline-flex items-center gap-0.5"
          aria-label={`${label}: ${count}`}
        >
          <span aria-hidden="true">{emoji}</span>
          <span>{count}</span>
        </span>
      ))}
      {breakdown.length > 1 ? (
        <span className="text-fg-muted/70" aria-label={`${total} reactions total`}>
          · {total} total
        </span>
      ) : null}
    </span>
  );
}

export { applyReactionPick };
