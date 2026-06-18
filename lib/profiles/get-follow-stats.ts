import { createClient } from "@/utils/supabase/server";

export type FollowStats = {
  followerCount: number;
  followingCount: number;
};

export async function getFollowStats(profileId: string): Promise<FollowStats> {
  const supabase = await createClient();

  const [{ count: followerCount }, { count: followingCount }] = await Promise.all([
    supabase
      .from("follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", profileId),
    supabase
      .from("follows")
      .select("following_id", { count: "exact", head: true })
      .eq("follower_id", profileId),
  ]);

  return {
    followerCount: followerCount ?? 0,
    followingCount: followingCount ?? 0,
  };
}
