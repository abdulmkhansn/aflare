export const DELETED_BUILDER_LABEL = "deleted builder";

export const PUBLIC_PROFILE_SELECT = "display_name, avatar_url, deleted, verified_builder" as const;

export type PublicProfile = {
  display_name: string | null;
  avatar_url: string | null;
  deleted?: boolean | null;
  verified_builder?: boolean | null;
};

export type PublicProfileWithId = PublicProfile & {
  id: string;
};

export function isDeletedProfile(
  profile: { deleted?: boolean | null; display_name?: string | null } | null | undefined
): boolean {
  return Boolean(profile?.deleted);
}

export function profileDisplayName(
  profile: PublicProfile | null | undefined,
  fallback = "Unknown builder"
): string {
  if (!profile) {
    return fallback;
  }

  if (isDeletedProfile(profile)) {
    return DELETED_BUILDER_LABEL;
  }

  return profile.display_name?.trim() || fallback;
}

export function profileAvatarUrl(profile: PublicProfile | null | undefined): string | null {
  if (isDeletedProfile(profile)) {
    return null;
  }

  return profile?.avatar_url ?? null;
}

export function authorLinkProps(userId: string, profile: PublicProfile | null | undefined) {
  const deleted = isDeletedProfile(profile);

  return {
    userId,
    displayName: profile?.display_name ?? null,
    avatarUrl: deleted ? null : profile?.avatar_url ?? null,
    deleted,
    verifiedBuilder: Boolean(profile?.verified_builder),
  };
}
