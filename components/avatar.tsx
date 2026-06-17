import Link from "next/link";

import { focusRingClassName } from "@/lib/ui/classes";

type AvatarProps = {
  displayName: string | null;
  avatarUrl: string | null;
  size?: "sm" | "md";
};

function initials(displayName: string | null) {
  const source = displayName?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function Avatar({ displayName, avatarUrl, size = "md" }: AvatarProps) {
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      className={`${sizeClass} inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--avatar-fallback-bg)] font-medium text-fg`}
      aria-hidden="true"
    >
      {initials(displayName)}
    </span>
  );
}

type AuthorLinkProps = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export function AuthorLink({ userId, displayName, avatarUrl }: AuthorLinkProps) {
  const name = displayName?.trim() || "Unknown builder";

  return (
    <Link
      href={`/u/${userId}`}
      className={`flex min-w-0 cursor-pointer items-center gap-2 ${focusRingClassName}`}
    >
      <Avatar displayName={displayName} avatarUrl={avatarUrl} size="sm" />
      <span className="truncate text-sm font-medium text-fg hover:underline">{name}</span>
    </Link>
  );
}
