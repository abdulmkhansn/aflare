import Link from "next/link";

import { VerifiedBuilderBadge } from "@/components/verification/verified-builder-badge";
import {
  DELETED_BUILDER_LABEL,
  profileDisplayName,
  profileAvatarUrl,
  isDeletedProfile,
} from "@/lib/profiles/public-fields";
import { focusRingClassName } from "@/lib/ui/classes";

type AvatarProps = {
  displayName: string | null;
  avatarUrl: string | null;
  size?: "sm" | "md";
  deleted?: boolean;
};

function initials(displayName: string | null, deleted = false) {
  if (deleted) {
    return "?";
  }

  const source = displayName?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function Avatar({ displayName, avatarUrl, size = "md", deleted = false }: AvatarProps) {
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  const resolvedUrl = deleted ? null : avatarUrl;

  if (resolvedUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolvedUrl}
        alt=""
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      className={`${sizeClass} inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--avatar-fallback-bg)] font-medium text-fg ${deleted ? "text-fg-muted" : ""}`}
      aria-hidden="true"
    >
      {initials(displayName, deleted)}
    </span>
  );
}

type AuthorLinkProps = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  deleted?: boolean;
  verifiedBuilder?: boolean;
};

export function AuthorLink({
  userId,
  displayName,
  avatarUrl,
  deleted = false,
  verifiedBuilder = false,
}: AuthorLinkProps) {
  const name = deleted
    ? DELETED_BUILDER_LABEL
    : profileDisplayName({ display_name: displayName, avatar_url: avatarUrl, deleted });
  const resolvedAvatarUrl = deleted ? null : avatarUrl;

  if (deleted) {
    return (
      <span className="flex min-w-0 items-center gap-2">
        <Avatar displayName={name} avatarUrl={null} size="sm" deleted />
        <span className="truncate text-sm font-medium text-fg-muted">{name}</span>
      </span>
    );
  }

  return (
    <Link
      href={`/u/${userId}`}
      className={`flex min-w-0 cursor-pointer items-center gap-2 ${focusRingClassName}`}
    >
      <Avatar displayName={displayName} avatarUrl={resolvedAvatarUrl} size="sm" />
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="truncate text-sm font-medium text-fg hover:underline">{name}</span>
        {verifiedBuilder ? <VerifiedBuilderBadge variant="compact" /> : null}
      </span>
    </Link>
  );
}

export { isDeletedProfile, profileDisplayName, profileAvatarUrl };
