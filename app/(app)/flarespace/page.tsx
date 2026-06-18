import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { FlareBrowseToolbar } from "@/components/flare-browse-toolbar";
import { FlareCard } from "@/components/flare-card";
import { FlareComposeForm } from "@/components/flare-compose-form";
import { PageHeader } from "@/components/page-header";
import { ShowMoreButton } from "@/components/show-more-button";
import { pageTitle } from "@/lib/app/brand";
import { buildShowMoreHref, parseBatchLimit } from "@/lib/app/pagination";
import { parseHelpfulError } from "@/lib/comments/parse-comment-params";
import {
  parseFlareSort,
  parseFlareStatusFilter,
  parseFlareView,
} from "@/lib/flares/flare-filters";
import { filterFlareTags } from "@/lib/flares/flare-tag-labels";
import { getFlarespaceLists } from "@/lib/flares/get-flares";
import { formatTagLabel } from "@/lib/tags/format-tag-label";
import {
  emptyStateClassName,
  errorTextClassName,
  inlineLinkClassName,
} from "@/lib/ui/classes";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: pageTitle("Flarespace"),
};

type FlarespacePageProps = {
  searchParams: Promise<{
    tag?: string;
    status?: string;
    sort?: string;
    view?: string;
    error?: string;
    helpfulError?: string;
    limit?: string;
  }>;
};

export default async function FlarespacePage({ searchParams }: FlarespacePageProps) {
  const auth = await requireOnboarded();
  const params = await searchParams;
  const status = parseFlareStatusFilter(params.status);
  const sort = parseFlareSort(params.sort);
  const view = parseFlareView(params.view);
  const helpfulError = parseHelpfulError(params);
  const batchLimit = parseBatchLimit(params.limit);
  const supabase = await createClient();

  const [
    { openFlares, yourFlares, helpingFlares, activeTagId, hasMoreOpen },
    { data: tags, error: tagsError },
    { data: ownedProjects },
  ] = await Promise.all([
    getFlarespaceLists(auth.userId, {
      limit: batchLimit,
      offset: 0,
      tagId: params.tag,
      status,
      sort,
    }),
    supabase.from("tags").select("id, label").order("label"),
    supabase.from("projects").select("id, name").eq("owner_id", auth.userId).order("name"),
  ]);

  const flareTags = filterFlareTags(tags ?? []);
  const activeTag = flareTags.find((row) => row.id === activeTagId) ?? null;
  const activeTagLabel = activeTag ? formatTagLabel(activeTag.label) : null;

  const showMoreHref = buildShowMoreHref("/flarespace", batchLimit, {
    tag: params.tag,
    status: status === "all" ? undefined : status,
    sort: sort === "fresh" ? undefined : sort,
    view: view === "open" ? undefined : view,
    helpfulError: params.helpfulError,
  });

  const flares =
    view === "mine" ? yourFlares : view === "helping" ? helpingFlares : openFlares;

  const emptyCopy =
    view === "mine"
      ? "You have not sent up a flare yet. Use the box above when you are stuck on something."
      : view === "helping"
        ? "You are not helping on any flares yet. Browse open flares and tap I can help."
        : activeTagLabel
          ? (
              <>
                No open flares tagged {activeTagLabel} right now. Try another tag or{" "}
                <Link href="/flarespace" className={inlineLinkClassName}>
                  view all flares
                </Link>
                .
              </>
            )
          : "No flares up right now. If you are stuck on something, send one up.";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flarespace"
        description="Where people get unstuck together."
      />

      <FlareComposeForm tags={flareTags} projects={ownedProjects ?? []} error={params.error} />

      <div className="border-t border-border-subtle pt-6">
        {helpfulError ? (
          <p className={`mb-4 ${errorTextClassName}`} role="alert">
            {helpfulError}
          </p>
        ) : null}

        {tagsError ? (
          <p className={`mb-4 ${errorTextClassName}`}>Could not load tags. Refresh the page.</p>
        ) : null}

        <Suspense fallback={<div className="mb-4 h-16" />}>
          <FlareBrowseToolbar tags={flareTags} activeTagId={activeTagId} activeView={view} />
        </Suspense>

        <div className="mt-4 space-y-3">
          {activeTagLabel && view === "open" ? (
            <p className="text-xs text-fg-muted">Showing flares tagged {activeTagLabel}.</p>
          ) : null}

          {flares.length === 0 ? (
            <div className={emptyStateClassName}>{emptyCopy}</div>
          ) : (
            <>
              {flares.map((flare) => (
                <FlareCard key={`${view}-${flare.id}`} flare={flare} />
              ))}
              {view === "open" && hasMoreOpen ? <ShowMoreButton href={showMoreHref} /> : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
