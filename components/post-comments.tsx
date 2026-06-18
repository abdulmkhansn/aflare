"use client";

import Link from "next/link";
import { useState } from "react";

import { deleteComment, updateComment } from "@/app/(app)/actions/content";
import { createComment } from "@/app/(app)/actions/comments";
import { Avatar } from "@/components/avatar";
import { VerifiedBuilderBadge } from "@/components/verification/verified-builder-badge";
import {
  isDeletedProfile,
  profileAvatarUrl,
  profileDisplayName,
} from "@/lib/profiles/public-fields";
import { ContentTimestamp } from "@/components/content-timestamp";
import { EditableContentBody } from "@/components/editable-content-body";
import { ThisHelpedButton } from "@/components/this-helped-button";
import { MentionTextarea } from "@/components/mentions/mention-textarea";
import type { Comment } from "@/lib/comments/types";
import { resolveCommentProfile } from "@/lib/comments/types";
import { useInlineFormAction } from "@/lib/ui/use-inline-form-action";
import {
  errorTextClassName,
  focusRingClassName,
  primaryButtonClassName,
  statusTextClassName,
  textLinkClassName,
} from "@/lib/ui/classes";

type CommentItemProps = {
  comment: Comment;
  currentUserId: string;
  redirectTo: string;
  isMarked: boolean;
};

function CommentItem({
  comment,
  currentUserId,
  redirectTo,
  isMarked,
}: CommentItemProps) {
  const profile = resolveCommentProfile(comment);
  const displayName = profileDisplayName(profile);
  const deleted = isDeletedProfile(profile);
  const isOwnComment = comment.author_id === currentUserId;

  return (
    <li className="flex gap-3 border-t border-border-subtle py-3 first:border-t-0 first:pt-0">
      {deleted ? (
        <span className="shrink-0">
          <Avatar displayName={displayName} avatarUrl={null} size="sm" deleted />
        </span>
      ) : (
        <Link href={`/u/${comment.author_id}`} className={`shrink-0 ${focusRingClassName}`}>
          <Avatar
            displayName={profile?.display_name ?? null}
            avatarUrl={profileAvatarUrl(profile)}
            size="sm"
          />
        </Link>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {deleted ? (
            <span className="text-sm font-medium text-fg-muted">{displayName}</span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Link
                href={`/u/${comment.author_id}`}
                className={`text-sm font-medium text-fg hover:underline ${focusRingClassName}`}
              >
                {displayName}
              </Link>
              {profile?.verified_builder ? <VerifiedBuilderBadge variant="compact" /> : null}
            </span>
          )}
          <ContentTimestamp createdAt={comment.created_at} editedAt={comment.edited_at} />
        </div>

        <div className="mt-1">
          <EditableContentBody
            body={comment.body}
            isAuthor={isOwnComment}
            editAction={updateComment}
            deleteAction={deleteComment}
            hiddenFields={{
              comment_id: comment.id,
              redirect_to: redirectTo,
            }}
            deleteTitle="Delete this comment?"
            deleteDescription="It'll be gone for good. Reputation from helpful marks adjusts automatically."
          />
        </div>

        {!isOwnComment ? (
          <ThisHelpedButton
            commentId={comment.id}
            helpfulCount={comment.helpful_count ?? 0}
            isMarked={isMarked}
            redirectTo={redirectTo}
          />
        ) : null}
      </div>
    </li>
  );
}

function AddCommentForm({ postId, redirectTo }: { postId: string; redirectTo: string }) {
  const [body, setBody] = useState("");
  const { onSubmit, isPending, error, success } = useInlineFormAction(createComment, {
    onSuccess: () => setBody(""),
  });

  return (
    <div className="border-t border-border-subtle pt-3">
      {success ? (
        <p className={`mb-3 ${statusTextClassName}`} role="status">
          Posted.
        </p>
      ) : null}

      {error ? (
        <p className={`mb-3 ${errorTextClassName}`} role="alert">
          {error}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-3">
        <input type="hidden" name="post_id" value={postId} />
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <label htmlFor={`comment-${postId}`} className="sr-only">
          Comment
        </label>
        <MentionTextarea
          id={`comment-${postId}`}
          name="body"
          rows={2}
          required
          value={body}
          onChange={setBody}
          disabled={isPending}
          className="min-h-[4.5rem]"
          placeholder="Reply with something useful."
        />

        <button type="submit" className={primaryButtonClassName} disabled={isPending}>
          {isPending ? "Posting…" : "Comment"}
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
  defaultCollapsed?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  hideCollapsedToggle?: boolean;
};

function commentToggleLabel(count: number): string {
  if (count === 0) {
    return "Comment";
  }

  return count === 1 ? "1 comment" : `${count} comments`;
}

export { commentToggleLabel };

export function PostComments({
  postId,
  comments,
  markedCommentIds,
  currentUserId,
  redirectTo,
  commentPosted,
  commentError,
  helpfulError,
  defaultCollapsed = false,
  expanded: expandedProp,
  onExpandedChange,
  hideCollapsedToggle = false,
}: PostCommentsProps) {
  const [internalExpanded, setInternalExpanded] = useState(
    !defaultCollapsed || Boolean(commentPosted || commentError || helpfulError)
  );
  const expanded = expandedProp ?? internalExpanded;

  function setExpanded(next: boolean) {
    if (onExpandedChange) {
      onExpandedChange(next);
    } else {
      setInternalExpanded(next);
    }
  }

  if (defaultCollapsed && !expanded && !hideCollapsedToggle) {
    return (
      <div className="mt-3 border-t border-border-subtle pt-3">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={textLinkClassName}
          aria-expanded={false}
        >
          {commentToggleLabel(comments.length)}
        </button>
      </div>
    );
  }

  if (defaultCollapsed && !expanded && hideCollapsedToggle) {
    return null;
  }

  return (
    <section className="mt-4 border-t border-border-subtle pt-4" aria-label="Comments">
      {defaultCollapsed ? (
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-fg-muted">Comments</h3>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className={`shrink-0 text-xs text-fg-muted hover:text-fg ${focusRingClassName}`}
            aria-expanded={true}
          >
            Hide
          </button>
        </div>
      ) : (
        <h3 className="text-sm font-medium text-fg-muted">Comments</h3>
      )}

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

      <AddCommentForm postId={postId} redirectTo={redirectTo} />
    </section>
  );
}
