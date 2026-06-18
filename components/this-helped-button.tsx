"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";

import { toggleCommentHelpful } from "@/app/(app)/actions/helpful-marks";
import { HELPFUL_ACTION_LABEL } from "@/lib/helpful/constants";
import { refreshInPlace } from "@/lib/ui/refresh-in-place";
import { focusRingClassName } from "@/lib/ui/classes";

type ThisHelpedButtonProps = {
  commentId: string;
  helpfulCount: number;
  isMarked: boolean;
  redirectTo: string;
};

export function ThisHelpedButton({
  commentId,
  helpfulCount,
  isMarked,
  redirectTo,
}: ThisHelpedButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimisticMarked, setOptimisticMarked] = useOptimistic(isMarked);
  const [optimisticCount, setOptimisticCount] = useOptimistic(helpfulCount);

  function handleClick() {
    startTransition(async () => {
      setError(null);
      const nextMarked = !optimisticMarked;
      setOptimisticMarked(nextMarked);
      setOptimisticCount(nextMarked ? optimisticCount + 1 : Math.max(0, optimisticCount - 1));

      const formData = new FormData();
      formData.set("comment_id", commentId);
      formData.set("is_marked", isMarked ? "1" : "0");
      formData.set("redirect_to", redirectTo);

      const result = await toggleCommentHelpful(formData);

      if (!result.ok) {
        setError(result.error);
        refreshInPlace(router);
        return;
      }

      refreshInPlace(router);
    });
  }

  return (
    <div>
      {error ? (
        <p className="mb-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={[
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
          focusRingClassName,
          optimisticMarked
            ? "bg-teal/15 text-teal"
            : "text-fg-muted hover:bg-[var(--hover-subtle)] hover:text-fg",
        ].join(" ")}
      >
        {HELPFUL_ACTION_LABEL}
        <span aria-hidden="true">·</span>
        <span>{optimisticCount}</span>
      </button>
    </div>
  );
}
