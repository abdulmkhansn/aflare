"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";

import { toggleCommentHelpful } from "@/app/(app)/actions/helpful-marks";
import {
  ActionRowError,
  ContentActionRow,
  HelpfulActionButton,
} from "@/components/content-action-row";
import { refreshInPlace } from "@/lib/ui/refresh-in-place";

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
    <ContentActionRow nested>
      {error ? <ActionRowError message={error} /> : null}
      <HelpfulActionButton
        count={optimisticCount}
        active={optimisticMarked}
        disabled={isPending}
        onClick={handleClick}
      />
    </ContentActionRow>
  );
}
