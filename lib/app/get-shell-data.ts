import { BLOCKER_POST_TYPES } from "@/lib/posts/post-types";
import { FEED_POST_SELECT, resolveFeedPostRelations } from "@/lib/feed/types";
import { createClient } from "@/utils/supabase/server";

export type ShellUser = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  verifiedBuilder: boolean;
  reputationScore: number;
};

export type SidebarBlocker = {
  id: string;
  excerpt: string;
  projectId: string;
  projectName: string;
  authorId: string;
  authorName: string | null;
};

export type SuggestedBuilder = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type ShellSidebarData = {
  blockers: SidebarBlocker[];
  suggestedBuilders: SuggestedBuilder[];
};

function truncateExcerpt(body: string, maxLength = 72): string {
  const trimmed = body.trim().replace(/\s+/g, " ");

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

export async function getShellUser(userId: string): Promise<ShellUser> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, verified_builder, reputation_score")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: userId,
    displayName: profile?.display_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    verifiedBuilder: Boolean(profile?.verified_builder),
    reputationScore: profile?.reputation_score ?? 0,
  };
}

export async function getSidebarBlockers(
  userId: string,
  limit = 5
): Promise<SidebarBlocker[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(FEED_POST_SELECT)
    .in("type", [...BLOCKER_POST_TYPES])
    .neq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((post) => {
    const { profile, project } = resolveFeedPostRelations(post);

    return {
      id: post.id,
      excerpt: truncateExcerpt(post.body),
      projectId: project?.id ?? post.project_id,
      projectName: project?.name ?? "Unknown project",
      authorId: post.author_id,
      authorName: profile?.display_name ?? null,
    };
  });
}

export async function getSuggestedBuilders(
  userId: string,
  limit = 5
): Promise<SuggestedBuilder[]> {
  const supabase = await createClient();

  const [{ data: userTags }, { data: follows }] = await Promise.all([
    supabase.from("profile_tags").select("tag_id").eq("profile_id", userId),
    supabase.from("follows").select("following_id").eq("follower_id", userId),
  ]);

  const tagIds = [...new Set(userTags?.map((row) => row.tag_id) ?? [])];
  const followingIds = new Set(follows?.map((row) => row.following_id) ?? []);

  if (tagIds.length === 0) {
    return [];
  }

  const { data: matches, error } = await supabase
    .from("profile_tags")
    .select("profile_id, profiles:profile_id ( id, display_name, avatar_url )")
    .in("tag_id", tagIds)
    .neq("profile_id", userId)
    .limit(limit * 4);

  if (error) {
    throw new Error(error.message);
  }

  const builders: SuggestedBuilder[] = [];
  const seen = new Set<string>();

  for (const row of matches ?? []) {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

    if (!profile || seen.has(profile.id) || followingIds.has(profile.id)) {
      continue;
    }

    seen.add(profile.id);
    builders.push({
      id: profile.id,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
    });

    if (builders.length >= limit) {
      break;
    }
  }

  return builders;
}

export async function getShellData(userId: string): Promise<{
  user: ShellUser;
  sidebar: ShellSidebarData;
}> {
  const [user, blockers, suggestedBuilders] = await Promise.all([
    getShellUser(userId),
    getSidebarBlockers(userId),
    getSuggestedBuilders(userId),
  ]);

  return {
    user,
    sidebar: { blockers, suggestedBuilders },
  };
}
