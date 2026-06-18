import Link from "next/link";

import { deletePost, updatePost } from "@/app/(app)/actions/content";
import { PostTypeBadge } from "@/components/post-type-badge";
import { PostMedia } from "@/components/post-media";
import { AuthorLink } from "@/components/avatar";
import { ContentTimestamp } from "@/components/content-timestamp";
import { EditableContentBody } from "@/components/editable-content-body";
import type { FeedPost } from "@/lib/feed/types";
import { resolveFeedPostRelations } from "@/lib/feed/types";
import { isSharePost, resolvePostKind } from "@/lib/posts/kinds";
import { parseStructuredFields } from "@/lib/posts/structured-fields";
import { focusRingClassName } from "@/lib/ui/classes";

type PostCardProps = {
  post: FeedPost;
  embedded?: boolean;
  currentUserId?: string;
  redirectTo?: string;
};

export function PostCard({ post, embedded = false, currentUserId, redirectTo = "/" }: PostCardProps) {
  const { profile, project } = resolveFeedPostRelations(post);
  const kind = resolvePostKind(post);
  const share = isSharePost(post);
  const fields = parseStructuredFields(post.structured_fields);
  const isAuthor = currentUserId === post.author_id;
  const canEdit = isAuthor && kind !== "article";

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <AuthorLink
            userId={post.author_id}
            displayName={profile?.display_name ?? null}
            avatarUrl={profile?.avatar_url ?? null}
          />
          <ContentTimestamp
            createdAt={post.created_at}
            editedAt={post.edited_at}
            className="mt-1 block text-xs text-fg-muted"
          />
        </div>
        {!share && kind !== "article" ? <PostTypeBadge type={post.type} /> : null}
        {kind === "article" ? (
          <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--badge-neutral-bg)] px-2 py-0.5 text-xs font-medium text-fg-muted">
            Article
          </span>
        ) : null}
      </div>

      {!share && project ? (
        <div className="mt-3">
          <Link
            href={`/projects/${project.id}`}
            className={`cursor-pointer text-sm font-medium text-fg hover:underline ${focusRingClassName}`}
          >
            {project.name}
          </Link>
        </div>
      ) : null}

      {post.body ? (
        <div className={`${share || !project ? "mt-3" : "mt-3"}`}>
          {canEdit ? (
            <EditableContentBody
              body={post.body}
              isAuthor
              editAction={updatePost}
              deleteAction={deletePost}
              hiddenFields={{
                post_id: post.id,
                redirect_to: redirectTo,
              }}
              deleteTitle="Delete this post?"
              deleteDescription="Comments and reactions go with it. You can't undo this."
            />
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg">{post.body}</p>
          )}
        </div>
      ) : null}

      <PostMedia fields={fields} />
    </>
  );

  if (embedded) {
    return content;
  }

  return content;
}
