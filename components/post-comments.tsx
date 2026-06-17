import Link from "next/link";

import { createComment } from "@/app/(app)/actions/comments";
import { Avatar } from "@/components/avatar";
import { ThisHelpedButton } from "@/components/this-helped-button";
import type { Comment } from "@/lib/comments/types";
import { resolveCommentProfile } from "@/lib/comments/types";
import { formatRelativeTime } from "@/lib/time/relative-time";
import {
  errorTextClassName,
  fieldClassName,
  focusRingClassName,
  primaryButtonClassName,
  statusTextClassName,
} from "@/lib/ui/classes";

type CommentItemProps = {
  comment: Comment;
  currentUserId: string;
  redirectTo: string;
  isMarked: boolean;
};

export function CommentItem({
  comment,
  currentUserId,
  redirectTo,
  isMarked,
}: CommentItemProps) {
  const profile = resolveCommentProfile(comment);
  const displayName = profile?.display_name?.trim() || "Unknown builder";
  const isOwnComment = comment.author_id === currentUserId;

  return (
    <li className="flex gap-3 border-t border-border-subtle py-3 first:border-t-0 first:pt-0">
      <Link href={`/u/${comment.author_id}`} className={`shrink-0 ${focusRingClassName}`}>
        <Avatar
          displayName={profile?.display_name ?? null}
          avatarUrl={profile?.avatar_url ?? null}
          size="sm"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            href={`/u/${comment.author_id}`}
            className={`text-sm font-medium text-fg hover:underline ${focusRingClassName}`}
          >
            {displayName}
          </Link>
          <time className="text-xs text-fg-muted" dateTime={comment.created_at}>
            {formatRelativeTime(comment.created_at)}
          </time>
        </div>

        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-fg">{comment.body}</p>

        {!isOwnComment ? (
          <div className="mt-2">
            <ThisHelpedButton
              commentId={comment.id}
              helpfulCount={comment.helpful_count ?? 0}
              isMarked={isMarked}
              redirectTo={redirectTo}
            />
          </div>
        ) : null}
      </div>
    </li>
  );
}

type AddCommentFormProps = {
  postId: string;
  redirectTo: string;
  posted?: boolean;
  error?: string;
};

export function AddCommentForm({ postId, redirectTo, posted, error }: AddCommentFormProps) {
  return (
    <div className="border-t border-border-subtle pt-3">
      {posted ? (
        <p className={`mb-3 ${statusTextClassName}`} role="status">
          Posted.
        </p>
      ) : null}

      {error ? (
        <p className={`mb-3 ${errorTextClassName}`} role="alert">
          {error}
        </p>
      ) : null}

      <form action={createComment} className="space-y-3">
        <input type="hidden" name="post_id" value={postId} />
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <label htmlFor={`comment-${postId}`} className="sr-only">
          Comment
        </label>
        <textarea
          id={`comment-${postId}`}
          name="body"
          rows={2}
          required
          className={fieldClassName}
          placeholder="Reply with something useful."
        />

        <button type="submit" className={primaryButtonClassName}>
          Comment
        </button>
      </form>
    </div>
  );
}

type PostCommentsProps = {
  postId: string;
  comments: Comment[];
  markedCommentIds: Set<string>;
  currentUserId: string;
  redirectTo: string;
  commentPosted?: boolean;
  commentError?: string;
  helpfulError?: string;
};

export function PostComments({
  postId,
  comments,
  markedCommentIds,
  currentUserId,
  redirectTo,
  commentPosted,
  commentError,
  helpfulError,
}: PostCommentsProps) {
  return (
    <section className="mt-4 border-t border-border-subtle pt-4" aria-label="Comments">
      <h3 className="text-sm font-medium text-fg-muted">Comments</h3>

      {helpfulError ? (
        <p className={`mt-2 ${errorTextClassName}`} role="alert">
          {helpfulError}
        </p>
      ) : null}

      {comments.length === 0 ? (
        <p className={`mt-3 ${statusTextClassName}`}>
          No replies yet. If you can help or have a useful take, leave a comment.
        </p>
      ) : (
        <ul className="mt-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              redirectTo={redirectTo}
              isMarked={markedCommentIds.has(comment.id)}
            />
          ))}
        </ul>
      )}

      <AddCommentForm
        postId={postId}
        redirectTo={redirectTo}
        posted={commentPosted}
        error={commentError}
      />
    </section>
  );
}
