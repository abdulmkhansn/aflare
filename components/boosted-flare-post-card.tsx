import { deletePost, updatePost } from "@/app/(app)/actions/content";
import { AuthorLink } from "@/components/avatar";
import { authorLinkProps, profileDisplayName } from "@/lib/profiles/public-fields";
import { ContentTimestamp } from "@/components/content-timestamp";
import { EditableContentBody } from "@/components/editable-content-body";
import { EmbeddedFlareCard, embeddedFlareUnavailableCopy } from "@/components/embedded-flare-card";
import { MentionBody } from "@/components/mentions/mention-body";
import { PostInteractionFooter } from "@/components/post-interaction-footer";
import { SharePostCardShell } from "@/components/share-post-card-shell";
import type { BookmarksContext } from "@/lib/bookmarks/types";
import type { Comment } from "@/lib/comments/types";
import type { FeedPost } from "@/lib/feed/types";
import {
  boostHeaderLabel,
  isBoostPost,
  isBoostedFlareUnavailable,
  resolveBoostedFlare,
} from "@/lib/posts/boost";
import type { PostReactionsContext } from "@/lib/reactions/types";
import { emptyStateClassName } from "@/lib/ui/classes";

type BoostedFlarePostCardProps = {
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

export function BoostedFlarePostCard({
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
}: BoostedFlarePostCardProps) {
  const displayName = profileDisplayName(
    Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
    "Someone"
  );
  const boostedFlare = resolveBoostedFlare(post);
  const unavailable = isBoostedFlareUnavailable(post);
  const isAuthor = post.author_id === currentUserId;
  const note = post.body?.trim() ?? "";

  return (
    <SharePostCardShell>
      <article id={`post-${post.id}`} className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <AuthorLink
              {...authorLinkProps(
                post.author_id,
                Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
              )}
            />
            <p className="mt-1 text-xs font-medium text-fg-muted">{boostHeaderLabel(displayName)}</p>
            <ContentTimestamp
              createdAt={post.created_at}
              editedAt={post.edited_at}
              className="mt-1 block text-xs text-fg-muted"
            />
          </div>
          {isAuthor && !note ? (
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
              deleteTitle="Delete this share?"
              deleteDescription="Your share goes away. The flare stays."
            />
          ) : null}
        </div>

        {note ? (
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
                deleteTitle="Delete this share?"
                deleteDescription="Your share goes away. The flare stays."
              />
            ) : (
              <MentionBody body={post.body} />
            )}
          </div>
        ) : null}

        <div className="mt-3">
          {unavailable ? (
            <div className={`${emptyStateClassName} py-4 text-sm`}>{embeddedFlareUnavailableCopy()}</div>
          ) : boostedFlare ? (
            <EmbeddedFlareCard flare={boostedFlare} currentUserId={currentUserId} />
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

export function isBoostFeedPost(post: FeedPost): boolean {
  return isBoostPost(post);
}
