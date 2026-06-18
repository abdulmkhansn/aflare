import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectHeader } from "@/components/project/project-header";
import { ProjectTimeline } from "@/components/project/project-timeline";
import { pageTitle } from "@/lib/app/brand";
import { parseHelpfulError } from "@/lib/comments/parse-comment-params";
import { getProjectPageData } from "@/lib/projects/get-project-page-data";
import { requireOnboarded } from "@/utils/auth/session";

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
  const auth = await requireOnboarded();
  const data = await getProjectPageData(id, auth.userId);

  return {
    title: data?.project.name ? pageTitle(data.project.name) : pageTitle("Project"),
  };
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const auth = await requireOnboarded();
  const { id } = await params;
  const query = await searchParams;
  const helpfulError = parseHelpfulError(query);
  const redirectTo = `/projects/${id}`;

  const data = await getProjectPageData(id, auth.userId);

  if (!data) {
    notFound();
  }

  const { project, timeline, commentsByPostId, markedCommentIds, reactionsContext, bookmarksContext } = data;
  const isOwner = project.owner_id === auth.userId;

  const statusMessage = query.created
    ? "Project created."
    : query.updated
      ? "Project updated."
      : null;

  return (
    <div className="space-y-6">
      <ProjectHeader
        project={project}
        isOwner={isOwner}
        posted={query.posted === "1"}
        postError={query.error}
        statusMessage={statusMessage}
      />

      <ProjectTimeline
        entries={timeline}
        isOwner={isOwner}
        currentUserId={auth.userId}
        redirectTo={redirectTo}
        commentsByPostId={commentsByPostId}
        markedCommentIds={markedCommentIds}
        reactionsContext={reactionsContext}
        bookmarksContext={bookmarksContext}
        searchParams={query}
        helpfulError={helpfulError}
      />
    </div>
  );
}
