import { createClient } from "@/utils/supabase/server";

export async function isBlockedBetween(userId: string, otherUserId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blocks")
    .select("blocker_id")
    .or(
      `and(blocker_id.eq.${userId},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${userId})`
    )
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return (data?.length ?? 0) > 0;
}

export async function hasBlockedUser(blockerId: string, blockedId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blocks")
    .select("blocker_id")
    .eq("blocker_id", blockerId)
    .eq("blocked_id", blockedId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function getBlockedUserIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blocks")
    .select("blocker_id, blocked_id")
    .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

  if (error) {
    throw new Error(error.message);
  }

  const blocked = new Set<string>();

  for (const row of data ?? []) {
    blocked.add(row.blocker_id === userId ? row.blocked_id : row.blocker_id);
  }

  return blocked;
}
