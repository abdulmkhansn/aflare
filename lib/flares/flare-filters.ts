export const FLARE_STATUS_FILTERS = ["all", "open", "being_helped"] as const;

export type FlareStatusFilter = (typeof FLARE_STATUS_FILTERS)[number];

export const FLARE_SORT_OPTIONS = ["fresh", "unanswered"] as const;

export type FlareSortOption = (typeof FLARE_SORT_OPTIONS)[number];

export const FLARE_STATUS_FILTER_LABELS: Record<FlareStatusFilter, string> = {
  all: "All",
  open: "Open",
  being_helped: "Being helped",
};

export const FLARE_SORT_LABELS: Record<FlareSortOption, string> = {
  fresh: "Newest",
  unanswered: "No one's helping yet",
};

export function parseFlareStatusFilter(raw: string | undefined): FlareStatusFilter {
  if (raw && FLARE_STATUS_FILTERS.includes(raw as FlareStatusFilter)) {
    return raw as FlareStatusFilter;
  }

  return "all";
}

export function parseFlareSort(raw: string | undefined): FlareSortOption {
  if (raw && FLARE_SORT_OPTIONS.includes(raw as FlareSortOption)) {
    return raw as FlareSortOption;
  }

  return "fresh";
}

export const FLARE_VIEWS = ["open", "mine", "helping"] as const;

export type FlareView = (typeof FLARE_VIEWS)[number];

export const FLARE_VIEW_LABELS: Record<FlareView, string> = {
  open: "Open flares",
  mine: "My flares",
  helping: "Helping",
};

export function parseFlareView(raw: string | undefined): FlareView {
  if (raw && FLARE_VIEWS.includes(raw as FlareView)) {
    return raw as FlareView;
  }

  return "open";
}
