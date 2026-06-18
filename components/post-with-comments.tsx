import { PostCard } from "@/components/post-card";
import { PostCardShell } from "@/components/post-card-shell";
import { PostComments } from "@/components/post-comments";
import { PostReactionBar } from "@/components/post-reaction-bar";
import { SharePostCardShell } from "@/components/share-post-card-shell";
import { ArticleFeedCard } from "@/components/article-feed-card";
import type { Comment } from "@/lib/comments/types";
import type { FeedPost } from "@/lib/feed/types";
import { getPostReactionBarProps } from "@/lib/reactions/get-post-reaction-bar-props";
import type { PostReactionsContext } from "@/lib/reactions/types";
import { isSharePost, resolvePostKind } from "@/lib/posts/kinds";

type PostWithCommentsProps = {
  post: FeedPost;
  comments: Comment[];
  markedCommentIds: Set<string>;
  currentUserId: string;
  redirectTo: string;
  reactionsContext: PostReactionsContext;
  commentPosted?: boolean;
  commentError?: string;
};

export function PostWithComments({
  post,
  comments,
  markedCommentIds,
  currentUserId,
  redirectTo,
  reactionsContext,
  commentPosted,
  commentError,
}: PostWithCommentsProps) {
  const share = isSharePost(post);
  const kind = resolvePostKind(post);

  if (kind === "article") {
    return <ArticleFeedCard post={post} />;
  }

  const reactionProps = getPostReactionBarProps(post.id, post.author_id, reactionsContext);

  const inner = (
    <>
      <PostCard post={post} embedded currentUserId={currentUserId} redirectTo={redirectTo} />
      <PostReactionBar
        postId={post.id}
        currentUserId={currentUserId}
        redirectTo={redirectTo}
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
      />
    </>
  );

  if (share) {
    return (
      <SharePostCardShell>
        <div className="p-5">{inner}</div>
      </SharePostCardShell>
    );
  }

  return (
    <PostCardShell postType={post.type}>
      {inner}
    </PostCardShell>
  );
}
