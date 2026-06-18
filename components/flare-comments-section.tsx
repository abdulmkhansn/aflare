"use client";

import Link from "next/link";
import { useState } from "react";

import { deleteFlareComment, updateFlareComment } from "@/app/(app)/actions/content";
import { createFlareComment } from "@/app/(app)/actions/flares";
import { Avatar } from "@/components/avatar";
import { ContentTimestamp } from "@/components/content-timestamp";
import { EditableContentBody } from "@/components/editable-content-body";
import { FlareCommentReactionBar } from "@/components/flare-comment-reaction-bar";
import { MentionTextarea } from "@/components/mentions/mention-textarea";
import { getFlareCommentReactionBarProps } from "@/lib/reactions/get-flare-comment-reaction-bar-props";
import type { FlareCommentReactionsContext } from "@/lib/reactions/get-flare-comment-reaction-bar-props";
import {
  resolveFlareCommentProfile,
  type FlareComment,
} from "@/lib/flares/types";
import {
  errorTextClassName,
  fieldClassName,
  focusRingClassName,
  primaryButtonClassName,
  statusTextClassName,
} from "@/lib/ui/classes";

type FlareCommentItemProps = {
  comment: FlareComment;
  flareId: string;
  redirectTo: string;
  isMarked: boolean;
  canMarkHelpful: boolean;
  isOwnComment: boolean;
  currentUserId: string;
  reactionsContext: FlareCommentReactionsContext;
};

function FlareCommentItem({
  comment,
  flareId,
  redirectTo,
  isMarked,
  canMarkHelpful,
  isOwnComment,
  currentUserId,
  reactionsContext,
}: FlareCommentItemProps) {
  const profile = resolveFlareCommentProfile(comment);
  const displayName = profile?.display_name?.trim() || "Unknown builder";

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
          <ContentTimestamp createdAt={comment.created_at} editedAt={comment.edited_at} />
        </div>

        <div className="mt-1">
          <EditableContentBody
            body={comment.body}
            isAuthor={isOwnComment}
            editAction={updateFlareComment}
            deleteAction={deleteFlareComment}
            hiddenFields={{
              comment_id: comment.id,
              redirect_to: redirectTo,
            }}
            deleteTitle="Delete this reply?"
            deleteDescription="It'll be gone for good. Helpful marks adjust automatically."
          />
        </div>

        <FlareCommentReactionBar
          commentId={comment.id}
          flareId={flareId}
          commentAuthorId={comment.author_id}
          currentUserId={currentUserId}
          redirectTo={redirectTo}
          helpfulCount={comment.helpful_count ?? 0}
          isHelpfulMarked={isMarked}
          canMarkHelpful={canMarkHelpful}
          {...getFlareCommentReactionBarProps(comment.id, reactionsContext)}
        />
      </div>
    </li>
  );
}

type FlareCommentsSectionProps = {
  flareId: string;
  comments: FlareComment[];
  markedCommentIds: Set<string>;
  reactionsContext: FlareCommentReactionsContext;
  flareAuthorId: string;
  currentUserId: string;
  redirectTo: string;
  isResolved: boolean;
  commentError?: string;
  helpfulError?: string;
  embedded?: boolean;
};

export function FlareCommentsSection({
  flareId,
  comments,
  markedCommentIds,
  reactionsContext,
  flareAuthorId,
  currentUserId,
  redirectTo,
  isResolved,
  commentError,
  helpfulError,
  embedded = false,
}: FlareCommentsSectionProps) {
  const canMarkHelpful = currentUserId === flareAuthorId;
  const [replyBody, setReplyBody] = useState("");

  return (
    <section
      className={embedded ? undefined : "mt-6 border-t border-border-subtle pt-6"}
      aria-label="Discussion"
    >
      <h2 className="text-sm font-medium text-fg">Discussion</h2>

      {helpfulError ? (
        <p className={`mt-2 ${errorTextClassName}`} role="alert">
          {helpfulError}
        </p>
      ) : null}

      {comments.length === 0 ? (
        <p className={`mt-3 ${statusTextClassName}`}>
          No replies yet. Share an idea, a snippet, or a link if you can help.
        </p>
      ) : (
        <ul className="mt-3">
          {comments.map((comment) => (
            <FlareCommentItem
              key={comment.id}
              comment={comment}
              flareId={flareId}
              redirectTo={redirectTo}
              isMarked={markedCommentIds.has(comment.id)}
              canMarkHelpful={canMarkHelpful}
              isOwnComment={comment.author_id === currentUserId}
              currentUserId={currentUserId}
              reactionsContext={reactionsContext}
            />
          ))}
        </ul>
      )}

      {!isResolved ? (
        <div className="mt-4 border-t border-border-subtle pt-4">
          {commentError ? (
            <p className={`mb-3 ${errorTextClassName}`} role="alert">
              {commentError}
            </p>
          ) : null}

          <form action={createFlareComment} className="space-y-3">
            <input type="hidden" name="flare_id" value={flareId} />
            <input type="hidden" name="redirect_to" value={redirectTo} />

            <label htmlFor={`flare-comment-${flareId}`} className="sr-only">
              Reply
            </label>
            <MentionTextarea
              id={`flare-comment-${flareId}`}
              name="body"
              rows={3}
              required
              value={replyBody}
              onChange={setReplyBody}
              className={fieldClassName}
              placeholder="Reply with something useful."
            />

            <button type="submit" className={primaryButtonClassName}>
              Reply
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
