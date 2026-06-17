import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { PostWithComments } from "@/components/post-with-comments";
import { ShowMoreButton } from "@/components/show-more-button";
import { TagFilterChips } from "@/components/tag-filter-chips";
import { getBlockerPosts } from "@/lib/blockers/get-blocker-posts";
import { getCommentsForPosts } from "@/lib/comments/get-comments-for-posts";
import {
  parseCommentStatusForPost,
  parseHelpfulError,
} from "@/lib/comments/parse-comment-params";
import { formatTagLabel } from "@/lib/tags/format-tag-label";
import { pageTitle } from "@/lib/app/brand";
import { buildShowMoreHref, parseBatchLimit } from "@/lib/app/pagination";
import {
  emptyStateClassName,
  errorTextClassName,
  inlineLinkClassName,
} from "@/lib/ui/classes";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: pageTitle("Blockers"),
};

type BlockersPageProps = {
  searchParams: Promise<{
    tag?: string;
    commentPosted?: string;
    commentError?: string;
    helpfulError?: string;
    limit?: string;
  }>;
};

export default async function BlockersPage({ searchParams }: BlockersPageProps) {
  const auth = await requireOnboarded();
  const params = await searchParams;
  const { tag } = params;
  const supabase = await createClient();
  const helpfulError = parseHelpfulError(params);
  const batchLimit = parseBatchLimit(params.limit);
  const redirectTo = tag ? `/blockers?tag=${tag}` : "/blockers";

  const [{ posts, activeTagId, hasMore }, { data: tags, error: tagsError }] = await Promise.all([
    getBlockerPosts(tag, { limit: batchLimit, offset: 0 }),
    supabase.from("tags").select("id, label").order("label"),
  ]);

  const { commentsByPostId, markedCommentIds } = await getCommentsForPosts(
    posts.map((post) => post.id),
    auth.userId
  );

  const activeTag = tags?.find((row) => row.id === activeTagId) ?? null;
  const activeTagLabel = activeTag ? formatTagLabel(activeTag.label) : null;

  const showMoreHref = buildShowMoreHref("/blockers", batchLimit, {
    tag: params.tag,
    commentPosted: params.commentPosted,
    commentError: params.commentError,
    helpfulError: params.helpfulError,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blockers"
        description="Open blockers from builders who need a hand."
      />

      {helpfulError ? (
        <p className={errorTextClassName} role="alert">
          {helpfulError}
        </p>
      ) : null}

      {tagsError ? (
        <p className={errorTextClassName}>Could not load tags. Refresh the page.</p>
      ) : tags && tags.length > 0 ? (
        <TagFilterChips tags={tags} activeTagId={activeTagId} basePath="/blockers" />
      ) : null}

      {posts.length === 0 ? (
        <div className={emptyStateClassName}>
          {activeTagLabel ? (
            <>
              No blockers tagged {activeTagLabel} right now. Try another tag or{" "}
              <Link href="/blockers" className={inlineLinkClassName}>
                view all blockers
              </Link>
              .
            </>
          ) : (
            <>
              No open blockers right now. Check back when someone posts stuck or need testers.
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {activeTagLabel ? (
            <p className="text-xs text-fg-muted">Showing blockers tagged {activeTagLabel}.</p>
          ) : null}
          {posts.map((post) => {
            const commentStatus = parseCommentStatusForPost(params, post.id);

            return (
              <PostWithComments
                key={post.id}
                post={post}
                comments={commentsByPostId.get(post.id) ?? []}
                markedCommentIds={markedCommentIds}
                currentUserId={auth.userId}
                redirectTo={redirectTo}
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
