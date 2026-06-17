import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createPost } from "@/app/(app)/actions/posts";
import { PostWithComments } from "@/components/post-with-comments";
import { PostComposeForm } from "@/components/post-compose-form";
import { ProjectStageBadge } from "@/components/project-stage-badge";
import { AuthorLink } from "@/components/avatar";
import { pageTitle } from "@/lib/app/brand";
import { getCommentsForPosts } from "@/lib/comments/get-comments-for-posts";
import {
  parseCommentStatusForPost,
  parseHelpfulError,
} from "@/lib/comments/parse-comment-params";
import { FEED_POST_SELECT, type FeedPost } from "@/lib/feed/types";
import { getPostReactionsForPosts } from "@/lib/reactions/get-post-reactions";
import { formatTagLabel } from "@/lib/tags/format-tag-label";
import {
  cardClassName,
  emptyStateClassName,
  errorTextClassName,
  pageTitleClassName,
  sectionTitleClassName,
  statusTextClassName,
  tagPillClassName,
  textLinkClassName,
} from "@/lib/ui/classes";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    posted?: string;
    created?: string;
    updated?: string;
    error?: string;
    commentPosted?: string;
    commentError?: string;
    helpfulError?: string;
  }>;
};

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("name").eq("id", id).maybeSingle();

  return {
    title: project?.name ? pageTitle(project.name) : pageTitle("Project"),
  };
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const auth = await requireOnboarded();
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();
  const helpfulError = parseHelpfulError(query);
  const redirectTo = `/projects/${id}`;

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(
      `
      id,
      name,
      one_liner,
      stage,
      abstract_description,
      owner_id,
      profiles:owner_id ( id, display_name, avatar_url )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (projectError || !project) {
    notFound();
  }

  const owner = Array.isArray(project.profiles) ? project.profiles[0] : project.profiles;
  const isOwner = project.owner_id === auth.userId;

  const [{ data: projectTags }, { data: posts, error: postsError }] = await Promise.all([
    supabase
      .from("project_tags")
      .select("tag_id, tags ( id, label )")
      .eq("project_id", id),
    supabase
      .from("posts")
      .select(FEED_POST_SELECT)
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const postIds = posts?.map((post) => post.id) ?? [];

  const [{ commentsByPostId, markedCommentIds }, reactionsContext] = await Promise.all([
    getCommentsForPosts(postIds, auth.userId),
    getPostReactionsForPosts(postIds, auth.userId),
  ]);

  const statusMessage = query.created
    ? "Project created."
    : query.updated
      ? "Project updated."
      : null;

  return (
    <div className="space-y-6">
      {statusMessage ? (
        <p className={statusTextClassName} role="status">
          {statusMessage}
        </p>
      ) : null}

      <header className={cardClassName}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <h1 className={pageTitleClassName}>{project.name}</h1>
            <p className="text-sm text-fg-muted">{project.one_liner}</p>
            <ProjectStageBadge stage={project.stage} />
          </div>

          {isOwner ? (
            <Link href={`/projects/${id}/edit`} className={textLinkClassName}>
              Edit project
            </Link>
          ) : null}
        </div>

        {project.abstract_description ? (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-fg">
            {project.abstract_description}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {owner ? (
            <AuthorLink
              userId={owner.id}
              displayName={owner.display_name}
              avatarUrl={owner.avatar_url}
            />
          ) : null}
        </div>

        {projectTags && projectTags.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {projectTags.map((row) => {
              const tag = Array.isArray(row.tags) ? row.tags[0] : row.tags;
              if (!tag) return null;

              return (
                <li key={row.tag_id} className={tagPillClassName}>
                  {formatTagLabel(tag.label)}
                </li>
              );
            })}
          </ul>
        ) : null}
      </header>

      {isOwner ? (
        <PostComposeForm
          action={createPost}
          projectId={id}
          posted={query.posted === "1"}
          error={query.error}
          redirectField={`/projects/${id}`}
        />
      ) : null}

      <section className="space-y-4">
        <h2 className={sectionTitleClassName}>Build log</h2>

        {helpfulError ? (
          <p className={errorTextClassName} role="alert">
            {helpfulError}
          </p>
        ) : null}

        {postsError ? (
          <p className={errorTextClassName}>Could not load posts. Refresh the page.</p>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => {
            const commentStatus = parseCommentStatusForPost(query, post.id);

            return (
              <PostWithComments
                key={post.id}
                post={post as FeedPost}
                comments={commentsByPostId.get(post.id) ?? []}
                markedCommentIds={markedCommentIds}
                currentUserId={auth.userId}
                redirectTo={redirectTo}
                reactionsContext={reactionsContext}
                commentPosted={commentStatus.commentPosted}
                commentError={commentStatus.commentError}
              />
            );
          })
        ) : isOwner ? (
          <div className={emptyStateClassName}>
            No updates yet. Post your first update to start the log.
          </div>
        ) : (
          <div className={emptyStateClassName}>This project has no updates yet.</div>
        )}
      </section>
    </div>
  );
}
