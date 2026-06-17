import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { SearchResultsView } from "@/components/search-results-view";
import { pageTitle } from "@/lib/app/brand";
import { hasSearchResults, runSearch } from "@/lib/search/run-search";
import { emptyStateClassName } from "@/lib/ui/classes";

export const metadata: Metadata = {
  title: pageTitle("Search"),
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Search"
          description="Find builders, projects, and tags across Aflare."
        />
        <div className={emptyStateClassName}>
          Use the search box in the header. Try a builder name, project, or tag.
        </div>
      </div>
    );
  }

  const results = await runSearch(query);

  if (!hasSearchResults(results)) {
    return (
      <div className="space-y-6">
        <PageHeader title="Search" description={`Results for "${query}"`} />
        <div className={emptyStateClassName}>
          Nothing matched that search. Try a different word.
        </div>
      </div>
    );
  }

  return <SearchResultsView query={query} results={results} />;
}
