import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FlareDetailView } from "@/components/flare-detail-view";
import { PageHeader } from "@/components/page-header";
import { pageTitle } from "@/lib/app/brand";
import { parseHelpfulError } from "@/lib/comments/parse-comment-params";
import { isTargetBookmarked } from "@/lib/bookmarks/get-bookmarks";
import { getFlareDetail } from "@/lib/flares/get-flare-detail";
import { flareExcerpt } from "@/lib/flares/types";
import { requireOnboarded } from "@/utils/auth/session";

export const metadata: Metadata = {
  title: pageTitle("Flare"),
};

type FlareDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    commentError?: string;
    helpfulError?: string;
    error?: string;
  }>;
};

export default async function FlareDetailPage({ params, searchParams }: FlareDetailPageProps) {
  const auth = await requireOnboarded();
  const { id } = await params;
  const query = await searchParams;
  const redirectTo = `/flarespace/${id}`;
  const detail = await getFlareDetail(id, auth.userId);

  if (!detail) {
    notFound();
  }

  const isBookmarked = await isTargetBookmarked(auth.userId, "flare", id);

  const title = detail.flare.title?.trim() || flareExcerpt(detail.flare, 60);

  return (
    <div className="space-y-6">
      <PageHeader title={title} description="A flare thread. Ask, reply, mark it resolved when it's fixed." />

      <FlareDetailView
        detail={detail}
        currentUserId={auth.userId}
        redirectTo={redirectTo}
        isBookmarked={isBookmarked}
        statusMessages={{
          commentError: query.commentError,
          helpfulError: parseHelpfulError(query),
          error: query.error,
        }}
      />
    </div>
  );
}
