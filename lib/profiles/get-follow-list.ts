import { PUBLIC_PROFILE_SELECT, type PublicProfileWithId } from "@/lib/profiles/public-fields";
import { createClient } from "@/utils/supabase/server";

export type FollowListKind = "followers" | "following";

export type FollowListEntry = PublicProfileWithId;

export async function getFollowList(
  profileId: string,
  kind: FollowListKind
): Promise<FollowListEntry[]> {
  const supabase = await createClient();

  if (kind === "followers") {
    const { data, error } = await supabase
      .from("follows")
      .select(`follower_id, profiles:follower_id ( id, ${PUBLIC_PROFILE_SELECT} )`)
      .eq("following_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`getFollowList(${kind}):`, error.message);
      return [];
    }

    return (
      data
        ?.map((row) => {
          const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
          if (!profile?.id) {
            return null;
          }

          return profile as FollowListEntry;
        })
        .filter((entry): entry is FollowListEntry => entry !== null) ?? []
    );
  }

  const { data, error } = await supabase
    .from("follows")
    .select(`following_id, profiles:following_id ( id, ${PUBLIC_PROFILE_SELECT} )`)
    .eq("follower_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`getFollowList(${kind}):`, error.message);
    return [];
  }

  return (
    data
      ?.map((row) => {
        const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        if (!profile?.id) {
          return null;
        }

        return profile as FollowListEntry;
      })
      .filter((entry): entry is FollowListEntry => entry !== null) ?? []
  );
}
