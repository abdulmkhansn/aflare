import { getBlockedUserIds } from "@/lib/messages/blocks";
import { createClient } from "@/utils/supabase/server";

import { toIlikePattern } from "./escape-ilike";

const BUILDER_LIMIT = 10;

export type BuilderSearchResult = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export async function runBuilderSearch(
  query: string,
  currentUserId: string
): Promise<BuilderSearchResult[]> {
  const supabase = await createClient();
  const pattern = toIlikePattern(query);
  const blockedIds = await getBlockedUserIds(currentUserId);

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .ilike("display_name", pattern)
    .neq("id", currentUserId)
    .order("display_name")
    .limit(BUILDER_LIMIT + blockedIds.size);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .filter((row) => !blockedIds.has(row.id))
    .slice(0, BUILDER_LIMIT)
    .map((row) => ({
      id: row.id,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
    }));
}
