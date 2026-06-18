import { deletePost, updatePost } from "@/app/(app)/actions/content";
import { AuthorLink } from "@/components/avatar";
import { authorLinkProps, profileDisplayName } from "@/lib/profiles/public-fields";
import { ContentTimestamp } from "@/components/content-timestamp";
import { EditableContentBody } from "@/components/editable-content-body";
import { MentionBody } from "@/components/mentions/mention-body";
import { PostInteractionFooter } from "@/components/post-interaction-footer";
import { QuotedPostCard } from "@/components/quoted-post-card";
import { SharePostCardShell } from "@/components/share-post-card-shell";
import type { BookmarksContext } from "@/lib/bookmarks/types";
import type { Comment } from "@/lib/comments/types";
import type { FeedPost } from "@/lib/feed/types";
import { resolveFeedPostRelations } from "@/lib/feed/types";
import {
  isRepostOriginalUnavailable,
  isRepostPost,
  repostHeaderLabel,
  resolveRepostedPost,
} from "@/lib/posts/repost";
import type { PostReactionsContext } from "@/lib/reactions/types";
import { emptyStateClassName } from "@/lib/ui/classes";

type RepostPostCardProps = {
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

export function RepostPostCard({
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
}: RepostPostCardProps) {
  const { profile } = resolveFeedPostRelations(post);
  const displayName = profileDisplayName(profile, "Someone");
  const original = resolveRepostedPost(post);
  const unavailable = isRepostOriginalUnavailable(post);
  const isAuthor = post.author_id === currentUserId;
  const quote = post.body?.trim() ?? "";

  return (
    <SharePostCardShell>
      <article id={`post-${post.id}`} className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <AuthorLink {...authorLinkProps(post.author_id, profile)} />
            <p className="mt-1 text-xs font-medium text-fg-muted">{repostHeaderLabel(displayName)}</p>
            <ContentTimestamp
              createdAt={post.created_at}
              editedAt={post.edited_at}
              className="mt-1 block text-xs text-fg-muted"
            />
          </div>
          {isAuthor && !quote ? (
            <EditableContentBody
              body=""
              isAuthor
              emptyMenuOnly
              editAction={updatePost}
              deleteAction={deletePost}
              hiddenFields={{
                post_id: post.id,
                redirect_to: redirectTo,
              }}
              deleteTitle="Delete this repost?"
              deleteDescription="Your repost goes away. The original post stays."
            />
          ) : null}
        </div>

        {quote ? (
          <div className="mt-3">
            {isAuthor ? (
              <EditableContentBody
                body={post.body}
                isAuthor
                editAction={updatePost}
                deleteAction={deletePost}
                hiddenFields={{
                  post_id: post.id,
                  redirect_to: redirectTo,
                }}
                deleteTitle="Delete this repost?"
                deleteDescription="Your repost goes away. The original post stays."
              />
            ) : (
              <MentionBody body={post.body} />
            )}
          </div>
        ) : null}

        <div className="mt-3">
          {unavailable ? (
            <div className={`${emptyStateClassName} py-4 text-sm`}>
              Original post unavailable. It may have been removed.
            </div>
          ) : original ? (
            <QuotedPostCard post={original} />
          ) : null}
        </div>

        <PostInteractionFooter
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
      </article>
    </SharePostCardShell>
  );
}

export function isRepostFeedPost(post: FeedPost): boolean {
  return isRepostPost(post);
}
