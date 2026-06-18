import { PostCard } from "@/components/post-card";
import { PostCardShell } from "@/components/post-card-shell";
import { PostComments } from "@/components/post-comments";
import { PostReactionBar } from "@/components/post-reaction-bar";
import { RepostPostCard, isRepostFeedPost } from "@/components/repost-post-card";
import { SharePostCardShell } from "@/components/share-post-card-shell";
import { ArticleFeedCard } from "@/components/article-feed-card";
import type { BookmarksContext } from "@/lib/bookmarks/types";
import { getPostBookmarkTarget, isPostBookmarked } from "@/lib/bookmarks/get-bookmark-state";
import type { Comment } from "@/lib/comments/types";
import type { FeedPost } from "@/lib/feed/types";
import { getPostReactionBarProps } from "@/lib/reactions/get-post-reaction-bar-props";
import type { PostReactionsContext } from "@/lib/reactions/types";
import { canRepostPost } from "@/lib/posts/repost";
import { isSharePost, resolvePostKind } from "@/lib/posts/kinds";

type PostWithCommentsProps = {
  post: FeedPost;
  comments: Comment[];
  markedCommentIds: Set<string>;
  currentUserId: string;
  redirectTo: string;
  reactionsContext: PostReactionsContext;
  bookmarksContext: BookmarksContext;
  commentPosted?: boolean;
  commentError?: string;
  hideProjectLink?: boolean;
  collapseComments?: boolean;
};

export function PostWithComments({
  post,
  comments,
  markedCommentIds,
  currentUserId,
  redirectTo,
  reactionsContext,
  bookmarksContext,
  commentPosted,
  commentError,
  hideProjectLink = false,
  collapseComments = false,
}: PostWithCommentsProps) {
  const share = isSharePost(post);
  const kind = resolvePostKind(post);

  if (kind === "article") {
    const bookmarkTarget = getPostBookmarkTarget(post);

    return (
      <ArticleFeedCard
        post={post}
        isBookmarked={
          bookmarkTarget
            ? bookmarkTarget.targetType === "article"
              ? bookmarksContext.articleIds.has(bookmarkTarget.targetId)
              : bookmarksContext.postIds.has(bookmarkTarget.targetId)
            : false
        }
        bookmarkTarget={bookmarkTarget}
      />
    );
  }

  if (isRepostFeedPost(post)) {
    return (
      <RepostPostCard
        post={post}
        comments={comments}
        markedCommentIds={markedCommentIds}
        currentUserId={currentUserId}
        redirectTo={redirectTo}
        reactionsContext={reactionsContext}
        bookmarksContext={bookmarksContext}
        commentPosted={commentPosted}
        commentError={commentError}
        collapseComments={collapseComments}
      />
    );
  }

  const reactionProps = getPostReactionBarProps(post.id, post.author_id, reactionsContext);
  const showRepost = canRepostPost(post, currentUserId);
  const bookmarkTarget = getPostBookmarkTarget(post);
  const isBookmarked = isPostBookmarked(post, bookmarksContext);

  const inner = (
    <>
      <PostCard
        post={post}
        embedded
        hideProjectLink={hideProjectLink}
        currentUserId={currentUserId}
        redirectTo={redirectTo}
      />
      <PostReactionBar
        postId={post.id}
        currentUserId={currentUserId}
        redirectTo={redirectTo}
        canRepost={showRepost}
        bookmarkTargetType={bookmarkTarget?.targetType}
        bookmarkTargetId={bookmarkTarget?.targetId}
        isBookmarked={isBookmarked}
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
      />
    </>
  );

  if (share) {
    return (
      <SharePostCardShell>
        <div id={`post-${post.id}`} className="p-5">
          {inner}
        </div>
      </SharePostCardShell>
    );
  }

  return (
    <PostCardShell postType={post.type}>
      <div id={`post-${post.id}`}>{inner}</div>
    </PostCardShell>
  );
}
