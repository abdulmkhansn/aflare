export const FEED_FILTERS = ["all", "blockers", "shipped", "following"] as const;

export type FeedFilter = (typeof FEED_FILTERS)[number];

export const FEED_FILTER_LABELS: Record<FeedFilter, string> = {
  all: "All",
  blockers: "Blockers",
  shipped: "Shipped",
  following: "Following",
};

export function parseFeedFilter(raw: string | undefined): FeedFilter {
  if (raw && FEED_FILTERS.includes(raw as FeedFilter)) {
    return raw as FeedFilter;
  }

  return "all";
}
