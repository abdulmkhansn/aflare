"use client";

import { useState } from "react";

import { PostComments, commentToggleLabel } from "@/components/post-comments";
import { PostReactionBar } from "@/components/post-reaction-bar";
import type { BookmarksContext } from "@/lib/bookmarks/types";
import { getPostBookmarkTarget, isPostBookmarked } from "@/lib/bookmarks/get-bookmark-state";
import type { Comment } from "@/lib/comments/types";
import type { FeedPost } from "@/lib/feed/types";
import { isSharePost } from "@/lib/posts/kinds";
import { canRepostPost } from "@/lib/posts/repost";
import { getPostReactionBarProps } from "@/lib/reactions/get-post-reaction-bar-props";
import type { PostReactionsContext } from "@/lib/reactions/types";

type PostInteractionFooterProps = {
  post: FeedPost;
  comments: Comment[];
  markedCommentIds: Set<string>;
  currentUserId: string;
  redirectTo: string;
  reactionsContext: PostReactionsContext;
  bookmarksContext: BookmarksContext;
  commentPosted?: boolean;
  commentError?: string;
  collapseComments?: boolean;
};

export function PostInteractionFooter({
  post,
  comments,
  markedCommentIds,
  currentUserId,
  redirectTo,
  reactionsContext,
  bookmarksContext,
  commentPosted,
  commentError,
  collapseComments = false,
}: PostInteractionFooterProps) {
  const [commentsExpanded, setCommentsExpanded] = useState(
    !collapseComments || Boolean(commentPosted || commentError)
  );

  const reactionProps = getPostReactionBarProps(post.id, post.author_id, reactionsContext);
  const showRepost = canRepostPost(post, currentUserId);
  const bookmarkTarget = getPostBookmarkTarget(post);
  const isBookmarked = isPostBookmarked(post, bookmarksContext);
  const hideHelpfulMark = isSharePost(post);

  const commentAction =
    collapseComments && !commentsExpanded
      ? {
          label: commentToggleLabel(comments.length),
          onClick: () => setCommentsExpanded(true),
        }
      : undefined;

  return (
    <>
      <PostReactionBar
        postId={post.id}
        currentUserId={currentUserId}
        redirectTo={redirectTo}
        canRepost={showRepost}
        hideHelpfulMark={hideHelpfulMark}
        bookmarkTargetType={bookmarkTarget?.targetType}
        bookmarkTargetId={bookmarkTarget?.targetId}
        isBookmarked={isBookmarked}
        commentAction={commentAction}
        {...reactionProps}
      />
      <PostComments
        postId={post.id}
        comments={comments}
        markedCommentIds={markedCommentIds}
        currentUserId={currentUserId}
        redirectTo={redirectTo}
        commentPosted={commentPosted}
        commentError={commentError}
        defaultCollapsed={collapseComments}
        expanded={commentsExpanded}
        onExpandedChange={setCommentsExpanded}
        hideCollapsedToggle={collapseComments}
      />
    </>
  );
}
