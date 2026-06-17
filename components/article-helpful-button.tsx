import { toggleArticleHelpful } from "@/app/(app)/actions/helpful-marks";
import { HELPFUL_ACTION_LABEL } from "@/lib/helpful/constants";
import { focusRingClassName } from "@/lib/ui/classes";

type ArticleHelpfulButtonProps = {
  articleId: string;
  helpfulCount: number;
  isMarked: boolean;
  redirectTo: string;
};

export function ArticleHelpfulButton({
  articleId,
  helpfulCount,
  isMarked,
  redirectTo,
}: ArticleHelpfulButtonProps) {
  return (
    <form action={toggleArticleHelpful}>
      <input type="hidden" name="article_id" value={articleId} />
      <input type="hidden" name="is_marked" value={isMarked ? "1" : "0"} />
      <input type="hidden" name="redirect_to" value={redirectTo} />
      <button
        type="submit"
        className={[
          "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors",
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
