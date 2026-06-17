import { POST_BATCH_SIZE } from "@/lib/app/constants";
import type { FlareSortOption, FlareStatusFilter } from "@/lib/flares/flare-filters";
import {
  FLARE_SELECT,
  resolveFlareHelpers,
  type FlareListItem,
} from "@/lib/flares/types";
import { createClient } from "@/utils/supabase/server";

const FLARES_COLLECT_LIMIT = 200;

export type FlaresResult = {
  flares: FlareListItem[];
  activeTagId: string | null;
  hasMore: boolean;
};

export type FlarespaceListsResult = {
  openFlares: FlareListItem[];
  yourFlares: FlareListItem[];
  helpingFlares: FlareListItem[];
  activeTagId: string | null;
  hasMoreOpen: boolean;
  hasMoreYours: boolean;
  hasMoreHelping: boolean;
};

export type FlaresPagination = {
  limit?: number;
  offset?: number;
  tagId?: string | null;
  status?: FlareStatusFilter;
  sort?: FlareSortOption;
  includeResolved?: boolean;
};

function applyFlareFilters(
  flares: FlareListItem[],
  status: FlareStatusFilter,
  sort: FlareSortOption,
  tagId: string | null
): FlareListItem[] {
  let filtered = [...flares];

  if (tagId) {
    filtered = filtered.filter((flare) =>
      (flare.flare_tags ?? []).some((row) => row.tag_id === tagId)
    );
  }

  if (status === "open") {
    filtered = filtered.filter((flare) => flare.status === "open");
  } else if (status === "being_helped") {
    filtered = filtered.filter((flare) => flare.status === "being_helped");
  }

  if (sort === "unanswered") {
    filtered = filtered.filter(
      (flare) => flare.status === "open" && resolveFlareHelpers(flare).length === 0
    );
  }

  filtered.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return filtered;
}

async function fetchFlares(
  supabase: Awaited<ReturnType<typeof createClient>>,
  includeResolved: boolean
): Promise<FlareListItem[]> {
  let query = supabase
    .from("flares")
    .select(FLARE_SELECT)
    .order("created_at", { ascending: false })
    .limit(FLARES_COLLECT_LIMIT);

  if (!includeResolved) {
    query = query.neq("status", "resolved");
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as FlareListItem[];
}

export async function getFlarespaceLists(
  userId: string,
  pagination?: FlaresPagination
): Promise<FlarespaceListsResult> {
  const limit = pagination?.limit ?? POST_BATCH_SIZE;
  const offset = pagination?.offset ?? 0;
  const activeTagId = pagination?.tagId?.trim() || null;
  const status = pagination?.status ?? "all";
  const sort = pagination?.sort ?? "fresh";
  const supabase = await createClient();

  const [activeFlares, yourAllFlares, helperRows] = await Promise.all([
    fetchFlares(supabase, false),
    supabase
      .from("flares")
      .select(FLARE_SELECT)
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(FLARES_COLLECT_LIMIT),
    supabase.from("flare_helpers").select("flare_id").eq("user_id", userId),
  ]);

  if (yourAllFlares.error) {
    throw new Error(yourAllFlares.error.message);
  }

  if (helperRows.error) {
    throw new Error(helperRows.error.message);
  }

  const helpingIds = [...new Set(helperRows.data?.map((row) => row.flare_id) ?? [])];
  let helpingFlares: FlareListItem[] = [];

  if (helpingIds.length > 0) {
    const { data: helpingData, error: helpingError } = await supabase
      .from("flares")
      .select(FLARE_SELECT)
      .in("id", helpingIds)
      .neq("status", "resolved")
      .order("created_at", { ascending: false })
      .limit(FLARES_COLLECT_LIMIT);

    if (helpingError) {
      throw new Error(helpingError.message);
    }

    helpingFlares = (helpingData ?? []) as FlareListItem[];
  }

  const yours = (yourAllFlares.data ?? []) as FlareListItem[];
  const others = activeFlares.filter((flare) => flare.author_id !== userId);

  const filteredOpen = applyFlareFilters(others, status, sort, activeTagId);
  const filteredYours = applyFlareFilters(yours, status, sort, activeTagId);
  const filteredHelping = applyFlareFilters(helpingFlares, status, sort, activeTagId);

  return {
    openFlares: filteredOpen.slice(offset, offset + limit),
    yourFlares: filteredYours.slice(0, limit),
    helpingFlares: filteredHelping.slice(0, limit),
    activeTagId,
    hasMoreOpen: filteredOpen.length > offset + limit,
    hasMoreYours: filteredYours.length > limit,
    hasMoreHelping: filteredHelping.length > limit,
  };
}

export async function getFlares(
  pagination?: FlaresPagination
): Promise<FlaresResult> {
  const limit = pagination?.limit ?? POST_BATCH_SIZE;
  const offset = pagination?.offset ?? 0;
  const activeTagId = pagination?.tagId?.trim() || null;
  const status = pagination?.status ?? "all";
  const sort = pagination?.sort ?? "fresh";
  const supabase = await createClient();

  const data = await fetchFlares(supabase, Boolean(pagination?.includeResolved));
  const filtered = applyFlareFilters(data, status, sort, activeTagId);
  const page = filtered.slice(offset, offset + limit);

  return {
    flares: page,
    activeTagId,
    hasMore: filtered.length > offset + limit,
  };
}
