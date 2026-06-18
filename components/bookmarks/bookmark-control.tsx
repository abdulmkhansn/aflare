"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";

import { toggleBookmark } from "@/app/(app)/actions/bookmarks";
import { refreshInPlace } from "@/lib/ui/refresh-in-place";
import type { BookmarkTargetType } from "@/lib/bookmarks/types";
import { focusRingClassName } from "@/lib/ui/classes";

type BookmarkControlProps = {
  targetType: BookmarkTargetType;
  targetId: string;
  isSaved: boolean;
  disabled?: boolean;
  showLabel?: boolean;
};

function bookmarkButtonClass(active: boolean) {
  return [
    "group/bookmark relative inline-flex h-8 items-center gap-1 rounded-full border px-2.5 text-xs font-medium transition-colors",
    focusRingClassName,
    active
      ? "border-ember/30 bg-ember/15 text-ember"
      : "border-border-subtle text-fg-muted hover:border-ember/30 hover:text-fg",
  ].join(" ");
}

function IconBookmark({ filled, className = "h-3.5 w-3.5" }: { filled?: boolean; className?: string }) {
  if (filled) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M6 4a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v18l-6 -4l-6 4z" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 4a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v18l-6 -4l-6 4z" />
    </svg>
  );
}

export function BookmarkControl({
  targetType,
  targetId,
  isSaved,
  disabled = false,
  showLabel = true,
}: BookmarkControlProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(isSaved);
  const label = optimisticSaved ? "Saved" : "Save";

  function handleToggle() {
    startTransition(async () => {
      setOptimisticSaved(!optimisticSaved);

      const result = await toggleBookmark(targetType, targetId, optimisticSaved);

      if (result.error) {
        refreshInPlace(router);
        return;
      }

      refreshInPlace(router);
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={bookmarkButtonClass(optimisticSaved)}
      disabled={disabled || isPending}
      aria-label={label}
      aria-pressed={optimisticSaved}
      title={label}
    >
      <IconBookmark filled={optimisticSaved} />
      {showLabel ? <span>{label}</span> : null}
    </button>
  );
}

export { bookmarkButtonClass, IconBookmark };
