import {
  FLARE_SELECT,
  type FlareListItem,
} from "@/lib/flares/types";
import { createClient } from "@/utils/supabase/server";

export async function getUserEngagedTagIds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const tagIds = new Set<string>();

  const [{ data: profileTags }, { data: commentFlares }, { data: helperFlares }] =
    await Promise.all([
      supabase.from("profile_tags").select("tag_id").eq("profile_id", userId),
      supabase
        .from("flare_comments")
        .select("flare_id")
        .eq("author_id", userId),
      supabase.from("flare_helpers").select("flare_id").eq("user_id", userId),
    ]);

  for (const row of profileTags ?? []) {
    tagIds.add(row.tag_id);
  }

  const flareIds = [
    ...new Set([
      ...(commentFlares?.map((row) => row.flare_id) ?? []),
      ...(helperFlares?.map((row) => row.flare_id) ?? []),
    ]),
  ];

  if (flareIds.length > 0) {
    const { data: engagedTags } = await supabase
      .from("flare_tags")
      .select("tag_id")
      .in("flare_id", flareIds);

    for (const row of engagedTags ?? []) {
      tagIds.add(row.tag_id);
    }
  }

  return [...tagIds];
}

export async function getSuggestedFlares(
  userId: string,
  limit = 5
): Promise<FlareListItem[]> {
  const tagIds = await getUserEngagedTagIds(userId);

  if (tagIds.length === 0) {
    return [];
  }

  const supabase = await createClient();

  const { data: taggedFlares, error: tagError } = await supabase
    .from("flare_tags")
    .select("flare_id, tag_id")
    .in("tag_id", tagIds);

  if (tagError) {
    throw new Error(tagError.message);
  }

  const overlapByFlare = new Map<string, number>();

  for (const row of taggedFlares ?? []) {
    overlapByFlare.set(row.flare_id, (overlapByFlare.get(row.flare_id) ?? 0) + 1);
  }

  const candidateIds = [...overlapByFlare.keys()];

  if (candidateIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("flares")
    .select(FLARE_SELECT)
    .in("id", candidateIds)
    .neq("status", "resolved")
    .neq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit * 3);

  if (error) {
    throw new Error(error.message);
  }

  const ranked = ((data ?? []) as FlareListItem[])
    .sort((a, b) => {
      const overlapDiff = (overlapByFlare.get(b.id) ?? 0) - (overlapByFlare.get(a.id) ?? 0);

      if (overlapDiff !== 0) {
        return overlapDiff;
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, limit);

  return ranked;
}
