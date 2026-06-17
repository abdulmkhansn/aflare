import { toggleCommentHelpful } from "@/app/(app)/actions/helpful-marks";
import { HELPFUL_ACTION_LABEL } from "@/lib/helpful/constants";
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
  return (
    <form action={toggleCommentHelpful}>
      <input type="hidden" name="comment_id" value={commentId} />
      <input type="hidden" name="is_marked" value={isMarked ? "1" : "0"} />
      <input type="hidden" name="redirect_to" value={redirectTo} />
      <button
        type="submit"
        className={[
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
          focusRingClassName,
          isMarked
            ? "bg-teal/15 text-teal"
            : "text-fg-muted hover:bg-[var(--hover-subtle)] hover:text-fg",
        ].join(" ")}
      >
        {HELPFUL_ACTION_LABEL}
        <span aria-hidden="true">·</span>
        <span>{helpfulCount}</span>
      </button>
    </form>
  );
}
