import { PostWithComments } from "@/components/post-with-comments";
import { TimelineFlareEntry } from "@/components/project/timeline-flare-entry";
import { TimelineStageMarker } from "@/components/project/timeline-stage-marker";
import {
  parseCommentStatusForPost,
  type CommentSearchParams,
} from "@/lib/comments/parse-comment-params";
import type { FeedPost } from "@/lib/feed/types";
import type { ProjectTimelineEntry } from "@/lib/projects/project-timeline";
import type { PostReactionsContext } from "@/lib/reactions/types";
import type { Comment } from "@/lib/comments/types";
import { emptyStateClassName, errorTextClassName, sectionTitleClassName } from "@/lib/ui/classes";

type ProjectTimelineProps = {
  entries: ProjectTimelineEntry[];
  isOwner: boolean;
  currentUserId: string;
  redirectTo: string;
  commentsByPostId: Map<string, Comment[]>;
  markedCommentIds: Set<string>;
  reactionsContext: PostReactionsContext;
  searchParams: CommentSearchParams & { helpfulError?: string };
  helpfulError?: string | null;
};

function timelineDotClass(kind: ProjectTimelineEntry["kind"]) {
  if (kind === "stage") {
    return "h-2 w-2 border-border-subtle bg-surface-page";
  }
  if (kind === "flare") {
    return "h-3 w-3 border-ember/50 bg-ember/20";
  }
  return "h-3 w-3 border-ember bg-surface-page";
}

export function ProjectTimeline({
  entries,
  isOwner,
  currentUserId,
  redirectTo,
  commentsByPostId,
  markedCommentIds,
  reactionsContext,
  searchParams,
  helpfulError,
}: ProjectTimelineProps) {
  return (
    <section>
      <h2 className={sectionTitleClassName}>Build log</h2>

      {helpfulError ? (
        <p className={`mt-3 ${errorTextClassName}`} role="alert">
          {helpfulError}
        </p>
      ) : null}

      {entries.length === 0 ? (
        <div className={`mt-4 ${emptyStateClassName}`}>
          {isOwner
            ? "Nothing in the log yet. Post your first update above — even a rough note counts."
            : "No updates yet."}
        </div>
      ) : (
        <div className="relative mt-4">
          <div
            className="absolute top-2 bottom-2 left-[5px] w-px bg-border-subtle"
            aria-hidden="true"
          />

          <ul className="space-y-6">
            {entries.map((entry) => {
              const commentStatus =
                entry.kind === "post"
                  ? parseCommentStatusForPost(searchParams, entry.post.id)
                  : null;

              return (
                <li key={`${entry.kind}-${entry.id}`} className="relative pl-6">
                  <span
                    className={`absolute left-0 top-2 rounded-full border-2 ${timelineDotClass(entry.kind)}`}
                    aria-hidden="true"
                  />

                  {entry.kind === "stage" ? (
                    <TimelineStageMarker event={entry.event} />
                  ) : null}

                  {entry.kind === "flare" ? <TimelineFlareEntry flare={entry.flare} /> : null}

                  {entry.kind === "post" ? (
                    <PostWithComments
                      post={entry.post as FeedPost}
                      comments={commentsByPostId.get(entry.post.id) ?? []}
                      markedCommentIds={markedCommentIds}
                      currentUserId={currentUserId}
                      redirectTo={redirectTo}
                      reactionsContext={reactionsContext}
                      commentPosted={commentStatus?.commentPosted}
                      commentError={commentStatus?.commentError}
                      hideProjectLink
                      collapseComments
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
