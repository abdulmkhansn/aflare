import { Suspense } from "react";

import { FeedComposeForm } from "@/components/feed-compose-form";
import { FeedFilterBar } from "@/components/feed-filter-bar";
import { FlareFeedCard } from "@/components/flare-feed-card";
import { PageHeader } from "@/components/page-header";
import { PostWithComments } from "@/components/post-with-comments";
import { ShowMoreButton } from "@/components/show-more-button";
import { buildShowMoreHref, parseBatchLimit } from "@/lib/app/pagination";
import { getCommentsForPosts } from "@/lib/comments/get-comments-for-posts";
import {
  parseCommentStatusForPost,
  parseHelpfulError,
  type CommentSearchParams,
} from "@/lib/comments/parse-comment-params";
import { FALLBACK_FEED_NOTE } from "@/lib/feed/constants";
import { parseFeedFilter, FEED_FILTER_LABELS } from "@/lib/feed/feed-filters";
import { getFeedPosts } from "@/lib/feed/get-feed-posts";
import { getPostReactionsForPosts } from "@/lib/reactions/get-post-reactions";
import {
  emptyStateClassName,
  errorTextClassName,
} from "@/lib/ui/classes";
import { createClient } from "@/utils/supabase/server";

type FeedViewProps = {
  userId: string;
  searchParams: CommentSearchParams & {
    posted?: string;
    error?: string;
    limit?: string;
    filter?: string;
  };
};

export async function FeedView({ userId, searchParams }: FeedViewProps) {
  const params = searchParams;
  const filter = parseFeedFilter(params.filter);
  const supabase = await createClient();
  const helpfulError = parseHelpfulError(params);
  const batchLimit = parseBatchLimit(params.limit);

  const [{ items, usedFallback, hasMore }, { data: ownedProjects }] = await Promise.all([
    getFeedPosts(userId, { limit: batchLimit, offset: 0, filter }),
    supabase.from("projects").select("id, name").eq("owner_id", userId).order("name"),
  ]);

  const postIds = items
    .filter((item) => item.kind === "post")
    .map((item) => item.post.id);

  const [{ commentsByPostId, markedCommentIds }, reactionsContext] = await Promise.all([
    getCommentsForPosts(postIds, userId),
    getPostReactionsForPosts(postIds, userId),
  ]);

  const showMoreHref = buildShowMoreHref("/", batchLimit, {
    posted: params.posted,
    error: params.error,
    commentPosted: params.commentPosted,
    commentError: params.commentError,
    helpfulError: params.helpfulError,
    filter: filter === "all" ? undefined : filter,
  });

  const projects = ownedProjects ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feed"
        description="Build updates, shares, flares, and posts from people you follow."
      />

      <FeedComposeForm
        projects={projects}
        posted={params.posted === "1"}
        error={params.error}
      />

      <Suspense fallback={<div className="h-9" />}>
        <FeedFilterBar />
      </Suspense>

      {helpfulError ? (
        <p className={errorTextClassName} role="alert">
          {helpfulError}
        </p>
      ) : null}

      {items.length === 0 ? (
        <div className={emptyStateClassName}>
          {filter === "all" ? (
            <>
              Your feed is empty. Post above, or follow builders who share in the open.
            </>
          ) : filter === "following" ? (
            <>No posts from people you follow yet. Follow builders to see their updates here.</>
          ) : filter === "blockers" ? (
            <>No flares in your feed right now. Check Flarespace or send one up if you are stuck.</>
          ) : (
            <>No shipped updates in your feed right now. Post a win when you ship something.</>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {usedFallback && filter === "all" ? (
            <p className="text-xs text-fg-muted">{FALLBACK_FEED_NOTE}</p>
          ) : null}
          {filter !== "all" ? (
            <p className="text-xs text-fg-muted">Showing {FEED_FILTER_LABELS[filter].toLowerCase()}.</p>
          ) : null}
          {items.map((item) => {
            if (item.kind === "flare") {
              return <FlareFeedCard key={`flare-${item.id}`} flare={item.flare} />;
            }

            const commentStatus = parseCommentStatusForPost(params, item.post.id);

            return (
              <PostWithComments
                key={item.id}
                post={item.post}
                comments={commentsByPostId.get(item.post.id) ?? []}
                markedCommentIds={markedCommentIds}
                currentUserId={userId}
                redirectTo="/"
                reactionsContext={reactionsContext}
                commentPosted={commentStatus.commentPosted}
                commentError={commentStatus.commentError}
              />
            );
          })}
          {hasMore ? <ShowMoreButton href={showMoreHref} /> : null}
        </div>
      )}
    </div>
  );
}
