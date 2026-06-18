import { createClient } from "@/utils/supabase/server";

export type ProfilePageData = {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  verified_builder: boolean | null;
  deleted: boolean | null;
  github_username: string | null;
  verified_at: string | null;
};

const CORE_PROFILE_SELECT =
  "id, display_name, bio, avatar_url, verified_builder, deleted" as const;

const VERIFICATION_PROFILE_SELECT = "github_username, verified_at" as const;

const FULL_PROFILE_SELECT = `${CORE_PROFILE_SELECT}, ${VERIFICATION_PROFILE_SELECT}` as const;

function mergeProfile(
  core: Omit<ProfilePageData, "github_username" | "verified_at">,
  verification: { github_username?: string | null; verified_at?: string | null } | null
): ProfilePageData {
  return {
    ...core,
    github_username: verification?.github_username ?? null,
    verified_at: verification?.verified_at ?? null,
  };
}

export async function getProfileForPage(
  id: string
): Promise<{ profile: ProfilePageData | null; loadError: string | null }> {
  const supabase = await createClient();

  const { data: fullProfile, error: fullError } = await supabase
    .from("profiles")
    .select(FULL_PROFILE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (!fullError && fullProfile) {
    return { profile: fullProfile as ProfilePageData, loadError: null };
  }

  const { data: coreProfile, error: coreError } = await supabase
    .from("profiles")
    .select(CORE_PROFILE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (coreError) {
    return { profile: null, loadError: coreError.message };
  }

  if (!coreProfile) {
    return { profile: null, loadError: null };
  }

  const { data: verificationProfile, error: verificationError } = await supabase
    .from("profiles")
    .select(VERIFICATION_PROFILE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (verificationError) {
    return {
      profile: mergeProfile(coreProfile as ProfilePageData, null),
      loadError: null,
    };
  }

  return {
    profile: mergeProfile(coreProfile as ProfilePageData, verificationProfile),
    loadError: null,
  };
}
